$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot "..\src-tauri\icons"
New-Item -ItemType Directory -Force $iconsDir | Out-Null

function New-AppBitmap {
  param([int]$Size)

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::FromArgb(18, 32, 55))

  $rect = New-Object System.Drawing.Rectangle 0, 0, $Size, $Size
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(70, 210, 255)), ([System.Drawing.Color]::FromArgb(34, 104, 255)), 45
  $graphics.FillEllipse($brush, [int]($Size * 0.12), [int]($Size * 0.12), [int]($Size * 0.76), [int]($Size * 0.76))

  $fontSize = [Math]::Max(10, [int]($Size * 0.34))
  $font = New-Object System.Drawing.Font "Segoe UI", $fontSize, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $format = New-Object System.Drawing.StringFormat
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $graphics.DrawString("TR", $font, $textBrush, $rect, $format)

  $graphics.Dispose()
  $brush.Dispose()
  $font.Dispose()
  $format.Dispose()
  $textBrush.Dispose()

  return $bitmap
}

function Save-Png {
  param([int]$Size, [string]$Path)
  $bitmap = New-AppBitmap -Size $Size
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bitmap.Dispose()
}

Save-Png -Size 32 -Path (Join-Path $iconsDir "32x32.png")
Save-Png -Size 128 -Path (Join-Path $iconsDir "128x128.png")
Save-Png -Size 256 -Path (Join-Path $iconsDir "128x128@2x.png")
Save-Png -Size 256 -Path (Join-Path $iconsDir "icon.png")

$icoPngPath = Join-Path $iconsDir "icon.png"
$icoPath = Join-Path $iconsDir "icon.ico"
$pngBytes = [System.IO.File]::ReadAllBytes($icoPngPath)
$fs = [System.IO.File]::Create($icoPath)
$bw = New-Object System.IO.BinaryWriter $fs
$bw.Write([UInt16]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]1)
$bw.Write([Byte]0)
$bw.Write([Byte]0)
$bw.Write([Byte]0)
$bw.Write([Byte]0)
$bw.Write([UInt16]1)
$bw.Write([UInt16]32)
$bw.Write([UInt32]$pngBytes.Length)
$bw.Write([UInt32]22)
$bw.Write($pngBytes)
$bw.Dispose()
$fs.Dispose()

Write-Host "Generated Tauri icons in $iconsDir"
Get-ChildItem $iconsDir | Select-Object Name, Length
