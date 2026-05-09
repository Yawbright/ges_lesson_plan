param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('render', 'cloud-run', 'active')]
  [string]$Provider,

  [string]$Url
)

$secretArgs = @("PARSER_BACKEND=$Provider")

if ($Url) {
  $cleanUrl = $Url.TrimEnd('/')
  if ($Provider -eq 'render') {
    $secretArgs += "PARSER_RENDER_SERVICE_URL=$cleanUrl"
  } elseif ($Provider -eq 'cloud-run') {
    $secretArgs += "PARSER_CLOUD_RUN_SERVICE_URL=$cleanUrl"
  }
  $secretArgs += "PARSER_SERVICE_URL=$cleanUrl"
}

npx supabase secrets set @secretArgs
