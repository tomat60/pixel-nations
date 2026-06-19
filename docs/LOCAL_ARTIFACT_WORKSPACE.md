# Pixel Nations — Local Artifact Workspace

Status: ACTIVE PROJECT RULE
Date: 2026-06-19

## Rule

All future generated helper files should be organized under:

`/Users/tomchuck/Desktop/Pixel Nations/`

This prevents Desktop and Downloads from becoming cluttered.

## Recommended Folder Structure

- `/Users/tomchuck/Desktop/Pixel Nations/Audit Bundles`
- `/Users/tomchuck/Desktop/Pixel Nations/Merge Packages`
- `/Users/tomchuck/Desktop/Pixel Nations/Review Bundles`
- `/Users/tomchuck/Desktop/Pixel Nations/Handoffs`
- `/Users/tomchuck/Desktop/Pixel Nations/Strategy Docs`
- `/Users/tomchuck/Desktop/Pixel Nations/Temp`

## Important Clarification

Browser downloads may still appear in `~/Downloads`, because ChatGPT cannot control the browser'"'"'s download location.

However, any script created by ChatGPT should place generated outputs inside the Pixel Nations desktop workspace whenever practical.

## Future Script Rule

For future collectors, review bundles, and audit outputs, use:

`OUT_ROOT="/Users/tomchuck/Desktop/Pixel Nations/<Category>/<Package Name>"`

and ZIP outputs should usually go to the same category folder.

## Repo Safety

Do not put these local workspace folders inside the Git repo unless they are intentionally committed project docs/assets.

The repo remains:

`/Users/tomchuck/Desktop/pixel-nations`

The local artifact workspace remains:

`/Users/tomchuck/Desktop/Pixel Nations`

These are separate on purpose.


## No Manual Latest-File Hunting Rule

The user should not have to search through timestamped files to know what to upload.

Automation scripts that generate repeated reports must also write a stable latest/upload file, for example:

- `LATEST_OPS_REPORT.md`
- `LATEST_OPS_REPORT.json`
- `UPLOAD_THIS_OPS_REPORT.md`
- `UPLOAD_THIS_FILE.txt`

Terminal output must clearly print the exact file to upload.

This is a permanent automation-quality rule for Pixel Nations.
