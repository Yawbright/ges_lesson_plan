# Credit System - Comprehensive Security & Design Analysis

## Executive Summary

The credit purchase system is **generally well-architected** with good concurrency control and idempotency safeguards. No critical double-charge or data loss vulnerabilities found. However, there are several medium-priority design issues and error handling gaps that should be addressed.

---

## 1. HOW initializeCreditPurchase WORKS

### Flow in [src/lib/credits.ts](src/lib/credits.ts)
```typescript
export async function initializeCreditPurchase(packageId: string): Promise<InitializedCreditPurchase>
```

**Calls Edge Function**: `initialize-credit-purchase`

### Backend Implementation: [supabase/functions/initialize-credit-purchase/index.ts]

**Step-by-step process:**

1. **Authentication & Validation**
   - Extracts authenticated user from JWT
   - Validates packageId is provided (non-empty string)

2. **Check if Credit Purchasing is Enabled**
   - Queries `admin_app_settings` table for `credit_purchasing` key
   - Returns 403 error if disabled

3. **Load Credit Package**
   - Queries `credit_packages` table with:
     - `id = packageId`
     - `active = true`
   - Validates package exists
   - **Calls `isPackageAvailable(pack)`** to check promotion windows:
     - If `promo_starts_at` is in future: not available
     - If `promo_ends_at` is in past: not available

4. **Initialize Paystack Transaction**
   ```typescript
   const reference = `glp-${Date.now()}-${crypto.randomUUID().replaceAll('-', '')}`;
   ```
   - Generates unique reference (timestamp + UUID)
   - Calls Paystack `/transaction/initialize` API with:
     - email: user.email
     - amount: package.price_subunit (in kobo/cents)
     - currency: package.currency
     - reference: glp-{timestamp}-{uuid}
     - metadata: { userId, packageId, credits, bonusCredits }

5. **Store Pending Purchase Record**
   ```sql
   INSERT INTO credit_purchases (
     user_id, package_id, credits, amount_subunit, currency,
     paystack_reference, paystack_access_code, authorization_url,
     status = 'pending', raw_response
   )
   ```
   - Creates database record for audit trail
   - Unique constraint on `paystack_reference` prevents duplicate insertions

6. **Return Authorization Data to Client**
   ```json
   {
     "authorizationUrl": "https://checkout.paystack.com/...",
     "accessCode": "...",
     "reference": "glp-{timestamp}-{uuid}",
     "package": { ...credit package with amountSubunit }
   }
   ```

### ⚠️ Design Issues Found

#### Issue #1: Network Failure After Paystack Returns (MEDIUM)
- **Scenario**: 
  1. Paystack returns authorization_url and access_code ✅
  2. Network fails before `credit_purchases` INSERT completes ❌
  3. User clicks "Pay" on Paystack, payment succeeds
  4. No `credit_purchases` record exists in database
  5. `verify-credit-purchase` cannot find the purchase → 404 error
  6. Credits never credited to user

- **Current Code**:
  ```typescript
  const { error: insertError } = await service.from('credit_purchases').insert({...});
  if (insertError) {
    throw new Error(insertError.message);
  }
  return json({...}, 200);
  ```

- **No Recovery**: Function returns error, but Paystack has already charged user
- **User Experience**: User sees "Payment recorded on Paystack but error occurred" with no retry mechanism

- **Recommendation**: Implement polling/retry in client:
  ```typescript
  // Client should retry verify-credit-purchase even if initialize fails
  // After user completes Paystack checkout, poll verify endpoint
  ```

#### Issue #2: Reference Generation Race (LOW)
- **Reference**: `glp-${Date.now()}-${crypto.randomUUID()}`
- **Issue**: Two rapid requests could generate same `Date.now()` value
- **Impact**: Second request would have colliding timestamp (low probability)
- **Mitigation**: UUID portion provides uniqueness, but not guaranteed deterministic
- **Recommendation**: Reference should be deterministic per user-package combination

---

## 2. HOW verifyCreditPurchase WORKS

### Flow in [src/lib/credits.ts](src/lib/credits.ts)
```typescript
export async function verifyCreditPurchase(reference: string): Promise<{
  status: string;
  credited: boolean;
  credits: number;
  balance: number;
  message?: string;
}>
```

**Calls Edge Function**: `verify-credit-purchase`

### Backend Implementation: [supabase/functions/verify-credit-purchase/index.ts]

**Step-by-step process:**

1. **Authentication**
   - Extracts authenticated user from JWT

2. **Validate Reference**
   - Ensures reference is non-empty string

3. **Lookup Purchase Record**
   ```sql
   SELECT user_id, credits, amount_subunit, currency, status
   FROM credit_purchases
   WHERE paystack_reference = reference
   ```
   - Returns 404 if not found

4. **Permission Check**
   - Verifies `purchase.user_id === user.id`
   - Returns 403 if user doesn't own this purchase

5. **Call Paystack Verify API**
   ```
   GET https://api.paystack.co/transaction/verify/{reference}
   Authorization: Bearer PAYSTACK_SECRET_KEY
   ```
   - Paystack returns transaction details: status, amount, currency

6. **Handle Non-Success Statuses**
   If status != 'success':
   ```sql
   UPDATE credit_purchases
   SET status = CASE status
         WHEN 'abandoned' THEN 'abandoned'
         ELSE 'failed'
       END,
       verified_at = now(),
       raw_response = payload
   WHERE paystack_reference = reference
     AND status != 'success'
   ```
   - Returns: `{ status, credited: false, message: "Payment is {status}" }`

7. **Validate Amount & Currency**
   ```typescript
   if (Number(payload.data.amount) !== Number(purchase.amount_subunit)) {
     return json({ error: 'Verified amount does not match purchase amount' }, 400);
   }
   if (payload.data.currency !== purchase.currency) {
     return json({ error: 'Verified currency does not match purchase currency' }, 400);
   }
   ```
   - **Security Check**: Ensures payment amount matches what was promised

8. **Finalize Purchase & Credit User**
   ```typescript
   const { data: finalized, error: finalizeError } = await service.rpc(
     'finalize_credit_purchase',
     { p_reference: reference, p_raw_response: payload }
   );
   ```
   - See RPC analysis below

9. **Return Result**
   ```json
   {
     "status": "success",
     "credited": true,
     "credits": 50,
     "balance": 125
   }
   ```

### Race Condition: verify-credit-purchase vs paystack-webhook

**Scenario**: Both called simultaneously

1. **User clicks "Verify"** → calls verify-credit-purchase
2. **Paystack webhook arrives** → calls paystack-webhook
3. Both call `finalize_credit_purchase(reference, payload)`

**Protected by**: finalize_credit_purchase uses SQL `for update` lock

```sql
SELECT * FROM credit_purchases WHERE paystack_reference = p_reference FOR UPDATE;
if status = 'success' then RETURN (not credited)
else UPDATE status = 'success'; ADD CREDITS;
```

**Result**: 
- First call wins the lock, updates status='success', credits user
- Second call sees status='success' already, returns credited=false
- **No double-charge** ✅

---

## 3. RACE CONDITIONS & DOUBLE-CHARGE ANALYSIS

### 🟢 VERIFIED SAFE: Webhook + User Verification Race

**Scenario**: Webhook and verify endpoint both called within milliseconds

**Protection**: finalize_credit_purchase RPC function
```sql
-- Line 216 in 0002_credits_paystack.sql
SELECT * FROM credit_purchases WHERE paystack_reference = p_reference FOR UPDATE;
```

**How it works**:
1. `FOR UPDATE` acquires exclusive lock on the row
2. First caller (A) locks row, sees status='pending', updates to 'success', calls add_user_credits
3. Second caller (B) waits on lock
4. First caller (A) commits, releases lock
5. Second caller (B) acquires lock, sees status='success' already, returns false

**Result**: Credits added exactly once ✅

---

### 🟢 VERIFIED SAFE: Concurrent Credit Deductions (Generation)

**Scenario**: User clicks "Generate Lesson Plan" multiple times rapidly

**Protection**: consume_user_credits RPC function
```sql
-- Line 128-140 in 0002_credits_paystack.sql
SELECT b.balance INTO v_balance FROM user_credit_balances b 
WHERE b.user_id = p_user_id FOR UPDATE;

if v_balance < p_amount then
  RETURN (ok=false, error='INSUFFICIENT_CREDITS');
end if;

UPDATE user_credit_balances SET balance = balance - p_amount;
```

**How it works**:
1. First request locks balance row, sees 50 credits
2. Deducts 1 credit → 49 remaining
3. Second request waits on lock
4. First request releases lock
5. Second request acquires lock, sees 49 credits
6. Deducts 1 credit → 48 remaining

**Result**: Both requests succeed, balance correctly decremented twice ✅

---

### 🟡 MEDIUM CONCERN: Webhook Error Handling

**File**: [supabase/functions/paystack-webhook/index.ts](supabase/functions/paystack-webhook/index.ts)

**Issue**: Error response returns HTTP 500
```typescript
catch (err) {
  return json({ error: (err as Error).message }, 500);
}
```

**Problem**:
- Paystack treats 5xx as "delivery failed, retry later"
- Could cause duplicate webhook delivery attempts
- Second attempt would call finalize_credit_purchase again (but protected by `status='success'` check)

**Recommendation**: Return 200 with error payload
```typescript
catch (err) {
  // Log error for manual investigation
  return json({ 
    received: true,
    error: (err as Error).message,
    status: 'failed'
  }, 200);
}
```

---

### 🟢 VERIFIED SAFE: Webhook Signature Validation

**File**: [supabase/functions/paystack-webhook/index.ts](supabase/functions/paystack-webhook/index.ts#L17-L20)

```typescript
const rawBody = await req.text();
const signature = req.headers.get('x-paystack-signature') ?? '';
const expected = await hmacSha512Hex(secretKey, rawBody);

if (!signature || signature !== expected) {
  return json({ error: 'Invalid Paystack signature' }, 401);
}
```

**Verification**: HMAC-SHA512 signature validated before processing
- Only webhook with correct signature can trigger credit additions
- Prevents unauthorized credit grants ✅

---

## 4. ERROR HANDLING IN CREDIT DEDUCTION FLOWS

### ✅ Excellent: Generation Function Error Handling

**File**: [supabase/functions/generate-lesson-plan/index.ts](supabase/functions/generate-lesson-plan/index.ts)

```typescript
let creditDebit: Awaited<ReturnType<typeof consumeCreditsForRequest>> | null = null;

try {
  // 1. Deduct credits (BEFORE generation)
  creditDebit = await consumeCreditsForRequest(
    req, creditCost, 'lesson_generation', 
    'Lesson plan generation', {...}
  );

  // 2. Generate content
  const plan = await callClaudeJson<Record<string, unknown>>({...});
  
  // 3. Success - reward referral (non-blocking error)
  await rewardReferralIfQualified(creditDebit.user.id);

  return json({...plan, creditBalance: creditDebit.balance}, 200);

} catch (err) {
  // 4. Error handler
  if (creditDebit) {
    await refundCredits(
      creditDebit.user.id,
      creditCost,
      'Refund for failed lesson plan generation',
      {
        originalTransactionId: creditDebit.transactionId,
        reason: (err as Error).message,
      }
    );
  }
  return json({ error: (err as Error).message }, 500);
}
```

**What's Great**:
1. ✅ Credits deducted **BEFORE** generation starts
2. ✅ Clear error boundary: catch block handles ALL errors
3. ✅ **Automatic refund** on ANY error
4. ✅ Refund includes original transaction_id for audit trail
5. ✅ Referral reward won't block generation (error handled silently)

**Refund Flow**:
```typescript
export async function refundCredits(userId, amount, description, metadata) {
  const service = createServiceClient();
  await service.rpc('add_user_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_kind: 'refund',
    p_description: description,
    p_metadata: metadata,
  });
}
```
- Uses add_user_credits RPC function (atomic, safe)
- Creates audit record with kind='refund'
- No error thrown if fails (relies on RPC error handling)

**⚠️ Issue**: Refund failure is not re-thrown
```typescript
await refundCredits(...); // If this fails, error is silently logged but function continues
```
- If database connection fails during refund, user loses credits without notification
- Recommendation: Add explicit error handling:
  ```typescript
  try {
    await refundCredits(...);
  } catch (refundErr) {
    await logEdgeError({
      userId: creditDebit.user.id,
      action: 'credit_refund_failed',
      message: refundErr.message
    });
    throw new Error('Generation failed and refund failed. Contact support.');
  }
  ```

---

### ✅ Good: Credit Deduction Safety

**File**: [supabase/functions/_shared/credits.ts](supabase/functions/_shared/credits.ts#L14-L47)

```typescript
export async function consumeCreditsForRequest(req, amount, kind, description, metadata) {
  const user = await getAuthenticatedUser(req);
  const service = createServiceClient();

  const { data, error } = await service.rpc('consume_user_credits', {
    p_user_id: user.id,
    p_amount: amount,
    p_kind: kind,
    p_description: description,
    p_metadata: metadata,
  });

  if (error) throw new Error(error.message);

  const result = Array.isArray(data) ? data[0] : data;
  if (!result?.ok) {
    if (result?.error === 'INSUFFICIENT_CREDITS') {
      throw new HttpError(402, 'You do not have enough credits for this generation.', {
        code: 'INSUFFICIENT_CREDITS',
        balance: result.balance ?? 0,
        required: amount,
      });
    }
    throw new Error(result?.error ?? 'Unable to deduct credits.');
  }

  return {
    user,
    balance: Number(result.balance ?? 0),
    transactionId: result.transaction_id as string,
  };
}
```

**Error Handling**:
1. ✅ RPC errors caught and thrown
2. ✅ Insufficient credits returns HTTP 402 (Payment Required)
3. ✅ Includes balance and required amount in error response
4. ✅ Transaction ID returned for audit trail

**RPC Protection**: consume_user_credits has pessimistic lock
```sql
SELECT b.balance FROM user_credit_balances b WHERE b.user_id = p_user_id FOR UPDATE;
if v_balance < p_amount then RETURN (ok=false, error='INSUFFICIENT_CREDITS');
```

---

## 5. PAYMENT STATE MANAGEMENT

### 📊 credit_purchases Table Schema

```sql
CREATE TABLE credit_purchases (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  package_id text REFERENCES credit_packages(id),
  credits int NOT NULL,
  amount_subunit int NOT NULL,
  currency text NOT NULL DEFAULT 'GHS',
  paystack_reference text NOT NULL UNIQUE,
  paystack_access_code text,
  authorization_url text,
  status text CHECK (status IN ('pending','success','failed','abandoned')),
  verified_at timestamptz,
  raw_response jsonb,
  created_at timestamptz,
  updated_at timestamptz
);
```

**State Machine**:
```
[pending] --verify or webhook--> [success] (if Paystack charge succeeded)
   |
   +--verify or webhook--> [failed] (if Paystack charge failed)
   |
   +--verify or webhook--> [abandoned] (if user abandoned checkout)
```

**Good Design**:
- ✅ Unique constraint on paystack_reference prevents duplicate records
- ✅ raw_response stored for audit/debugging
- ✅ verified_at timestamp shows when payment was confirmed
- ✅ RLS policy allows users to read only their own purchases

**⚠️ Issue**: No index on user_id for fast lookups
```sql
CREATE INDEX IF NOT EXISTS credit_purchases_user_idx
  ON public.credit_purchases (user_id, created_at DESC);
```
This exists, so ✅ good.

---

## 6. WEBHOOK HANDLING FOR PAYSTACK

### Webhook Flow
**File**: [supabase/functions/paystack-webhook/index.ts](supabase/functions/paystack-webhook/index.ts)

```typescript
Deno.serve(async (req) => {
  // 1. Signature validation
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature') ?? '';
  const expected = await hmacSha512Hex(secretKey, rawBody);
  if (!signature || signature !== expected) {
    return json({ error: 'Invalid Paystack signature' }, 401);
  }

  // 2. Parse event
  const event = JSON.parse(rawBody);
  if (event?.event !== 'charge.success' && event?.event !== 'transaction.success') {
    return json({ received: true }, 200);
  }

  // 3. Validate reference exists and amount matches
  const reference = event?.data?.reference;
  const { data: purchase } = await service
    .from('credit_purchases')
    .select('amount_subunit,currency')
    .eq('paystack_reference', reference)
    .single();

  if (Number(event.data?.amount) !== Number(purchase.amount_subunit)) {
    return json({ error: 'Webhook amount mismatch' }, 400);
  }
  if (event.data?.currency !== purchase.currency) {
    return json({ error: 'Webhook currency mismatch' }, 400);
  }

  // 4. Finalize purchase (calls finalize_credit_purchase RPC)
  const { data: finalized, error: finalizeError } = await service.rpc(
    'finalize_credit_purchase',
    { p_reference: reference, p_raw_response: event }
  );

  if (finalizeError) throw new Error(finalizeError.message);

  return json({
    received: true,
    credited: Boolean(result?.credited),
    balance: Number(result?.balance ?? 0),
  }, 200);
});
```

**✅ Strengths**:
1. HMAC-SHA512 signature validation
2. Validates event type (only process 'charge.success' or 'transaction.success')
3. Validates reference exists
4. Validates amount & currency match
5. Calls finalize_credit_purchase (idempotent)

**⚠️ Issues**:

#### Issue #1: HTTP 500 on Error (MEDIUM)
```typescript
catch (err) {
  return json({ error: (err as Error).message }, 500);
}
```
- Paystack will retry 5xx responses
- Duplicate webhooks will be retried (but protected by status='success' check, so safe)
- Better to return 200 with error status

#### Issue #2: No Deduplication ID
- Webhook references are queryable by paystack_reference
- If Paystack retries: second call will:
  1. Find purchase record ✅
  2. Call finalize_credit_purchase
  3. RPC sees status='success' already
  4. Returns credited=false
  5. ✅ Safe - no double-charge
- No issue, just note-worthy design

#### Issue #3: Error Context Lost
- If finalize_credit_purchase RPC throws, error message is JSON stringified
- Paystack doesn't see full stack trace
- Makes debugging harder for webhook failures
- Recommendation: Log error to app_errors table:
  ```typescript
  catch (err) {
    await logEdgeError({
      action: 'paystack_webhook_failed',
      message: (err as Error).message,
      metadata: { reference: event.data?.reference }
    });
    return json({ received: true, error: (err as Error).message }, 200);
  }
  ```

---

## 7. CREDIT REFUND LOGIC

### Refund Mechanism

**Called from**: generation functions on error

**Files**:
- [supabase/functions/_shared/credits.ts](supabase/functions/_shared/credits.ts#L50-L58)
- [supabase/functions/generate-lesson-plan/index.ts](supabase/functions/generate-lesson-plan/index.ts#L72-L78)

```typescript
export async function refundCredits(userId, amount, description, metadata) {
  const service = createServiceClient();
  await service.rpc('add_user_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_kind: 'refund',
    p_description: description,
    p_metadata: metadata,
  });
}
```

**Refund Flow**:
1. Generation function consumes credits: `balance = 50 - 1 = 49`
2. Generation fails with error
3. Refund called: `balance = 49 + 1 = 50`
4. Audit trail shows both transactions:
   - `kind='lesson_generation', amount=-1, balance_after=49`
   - `kind='refund', amount=+1, balance_after=50`

**✅ Good**:
- Automatic on ANY error in generation
- Clear audit trail with original transaction_id
- Metadata includes reason and original transaction

**⚠️ Issues**:

#### Issue #1: Refund Failure Not Handled
```typescript
if (creditDebit) {
  await refundCredits(...); // No error handling!
}
```

- If database connection fails during refund:
  - User sees "Generation failed" error
  - No indication that refund also failed
  - Credits remain deducted
  - No alert to support team

**Recommendation**:
```typescript
if (creditDebit) {
  try {
    await refundCredits(...);
  } catch (refundErr) {
    console.error('[CRITICAL] Refund failed:', { userId, amount });
    await logEdgeError({
      userId: creditDebit.user.id,
      action: 'critical_refund_failure',
      message: `Failed to refund ${creditCost} credits`,
      metadata: { originalError: (err as Error).message }
    });
    throw new Error('Generation failed and refund failed. Please contact support.');
  }
}
```

#### Issue #2: Race Between Refund and Webhook
- **Scenario**:
  1. User initiates generation
  2. Credits consumed: balance = 49
  3. Claude API fails
  4. Refund queued: balance = 50
  5. Paystack webhook arrives: calls finalize_credit_purchase
  6. Adds credits: balance = 51
  
- **Result**: User ends up with credits from both refund AND webhook add
- **Likelihood**: Low (refund happens within milliseconds, webhook takes seconds)
- **Mitigation**: This is acceptable - generation and purchase are independent flows

---

## 8. RECOMMENDATIONS & PRIORITY FIXES

### 🔴 CRITICAL (Fix immediately)
None found.

### 🟠 HIGH (Fix within sprint)

1. **Add explicit error handling to refund calls**
   ```typescript
   // In generate-lesson-plan.ts, generate-scheme.ts, etc.
   if (creditDebit) {
     try {
       await refundCredits(...);
     } catch (refundErr) {
       await logEdgeError({...});
       throw new Error('Credits were not refunded. Contact support.');
     }
   }
   ```

2. **Fix webhook error response code**
   ```typescript
   // In paystack-webhook/index.ts
   catch (err) {
     return json({ received: true, error: err.message }, 200); // Not 500!
   }
   ```

### 🟡 MEDIUM (Fix soon)

1. **Improve initialize-credit-purchase error messaging**
   - If database INSERT fails, provide recovery steps to client
   - Client should implement polling retry:
     ```typescript
     // After user completes Paystack checkout, poll:
     // const result = await verifyCreditPurchase(reference);
     // Retry until success or timeout
     ```

2. **Add webhook error logging**
   ```typescript
   // In paystack-webhook/index.ts
   catch (err) {
     await logEdgeError({
       action: 'paystack_webhook_failed',
       message: err.message,
       metadata: { reference }
     });
     return json({ received: true }, 200);
   }
   ```

3. **Add idempotency to reference generation**
   - Current: `glp-${Date.now()}-${crypto.randomUUID()}`
   - Better: Hash of user_id + timestamp for deterministic generation

### 🟢 LOW (Nice to have)

1. **Add error codes to responses**
   ```typescript
   // Instead of just error message
   return json({ 
     error: 'Payment verification failed',
     code: 'PAYSTACK_VERIFY_FAILED',
     retryable: true 
   }, 502);
   ```

2. **Add more detailed amount validation**
   - Warn if user is about to buy more credits than they've ever used
   - Implement fraud detection for unusual patterns

---

## CONCLUSION

**Security**: ✅ Good
- No double-charge vulnerabilities
- Proper idempotency with FOR UPDATE locks
- HMAC webhook validation
- Amount/currency verification

**Reliability**: ⚠️ Needs improvement
- Missing error handling on refund failures
- Webhook returns 500 on error (triggers retries)
- No recovery mechanism for initialize-credit-purchase failures

**Design**: ✅ Good
- Clear state machine for purchases
- Comprehensive audit trail
- Atomic RPC functions prevent partial updates
- Good separation of concerns

**Recommended Priority**: Fix refund error handling and webhook error codes first, then improve initialize-credit-purchase error messages.
