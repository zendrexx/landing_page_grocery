# Downscale the 2580x5592 masters to the exact App Store 6.9" size (1290x2796).
# Exactly 0.5x, so it is a clean box filter with no resampling artefacts.
Add-Type -AssemblyName System.Drawing

$root = Split-Path $MyInvocation.MyCommand.Path -Parent

foreach ($theme in @('light', 'dark')) {
  $dest = Join-Path $root "store\$theme"
  New-Item -ItemType Directory -Path $dest -Force | Out-Null
  Get-ChildItem (Join-Path $root "$theme\*.png") | ForEach-Object {
    $img = [System.Drawing.Image]::FromFile($_.FullName)
    $w = [int]($img.Width / 2); $h = [int]($img.Height / 2)
    $bmp = New-Object System.Drawing.Bitmap($w, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $w, $h)
    $g.Dispose(); $img.Dispose()
    $bmp.Save((Join-Path $dest $_.Name), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
  }
  Write-Output "$theme -> $dest"
}
