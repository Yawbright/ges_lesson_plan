-- Create payment recovery tokens table
-- This allows recovery from DB INSERT failures after Paystack payment is initiated

CREATE TABLE IF NOT EXISTS public.payment_recovery_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  paystack_reference TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  package_id TEXT NOT NULL REFERENCES public.credit_packages(id),
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  recovered_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'recovered', 'abandoned')),
  error_reason TEXT
);

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_payment_recovery_token ON public.payment_recovery_tokens(token);
CREATE INDEX IF NOT EXISTS idx_payment_recovery_user ON public.payment_recovery_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_recovery_reference ON public.payment_recovery_tokens(paystack_reference);

-- Add RLS policies
ALTER TABLE public.payment_recovery_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own recovery tokens
DROP POLICY IF EXISTS "Users can view own recovery tokens" ON public.payment_recovery_tokens;
CREATE POLICY "Users can view own recovery tokens"
  ON public.payment_recovery_tokens FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can manage all recovery tokens
DROP POLICY IF EXISTS "Service role manages recovery tokens" ON public.payment_recovery_tokens;
CREATE POLICY "Service role manages recovery tokens"
  ON public.payment_recovery_tokens FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
