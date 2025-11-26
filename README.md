# Claude Code Usage - GNOME Extension

A GNOME Shell extension that displays your Claude Code usage limits directly in the system panel by running the `/usage` command.

## Features

- Shows highest usage percentage in the top panel (e.g., "45%")
- Displays detailed breakdown for all models (Sonnet, Haiku, Opus) in dropdown menu
- Visual progress bars for each model
- Auto-refreshes every 5 minutes
- Manual refresh option
- Runs `/usage` command to get real-time usage data

## Installation

1. Copy the extension to your GNOME extensions directory:
   ```bash
   cp -r claude-usage-checker@gnome ~/.local/share/gnome-shell/extensions/
   ```

2. Restart GNOME Shell:
   - On X11: Press `Alt+F2`, type `r`, and press Enter
   - On Wayland: Log out and log back in

3. Enable the extension:
   ```bash
   gnome-extensions enable claude-usage-checker@gnome
   ```

## Usage

- The panel shows the highest usage percentage across all models
- Click the indicator to see detailed breakdown:
  - **Sonnet**: Usage and limit with percentage
  - **Haiku**: Usage and limit with percentage
  - **Opus**: Usage and limit with percentage
  - Visual progress bars for each model
- Click "Refresh" to manually update usage data
- The extension automatically refreshes every 5 minutes

## Example Display

**Panel**: `45%`

**Dropdown**:
```
Sonnet: 12K / 100K (12.0%)
  ███░░░░░░░░░░░░
Haiku: 45K / 100K (45.0%)
  ███████░░░░░░░░
Opus: 5K / 50K (10.0%)
  ██░░░░░░░░░░░░░
```

## Requirements

- GNOME Shell 45 or 46
- Claude Code installed and available in PATH
- Python 3

## How It Works

The extension runs a Python script (`get-usage.py`) that:
1. Executes `claude` with the `/usage` command
2. Parses the output to extract usage data for each model
3. Returns the data as JSON
4. The extension displays this data with visual indicators

## Troubleshooting

If the extension shows "ERR":
- Ensure Claude Code is installed: `which claude`
- Try running `/usage` manually in Claude Code
- Check the extension logs: `journalctl -f -o cat /usr/bin/gnome-shell`
- Verify Python 3 is installed: `python3 --version`

If no data appears:
- The script may not be able to parse the `/usage` output
- Check that you have an active Claude Code subscription
- Try running the script manually: `python3 ~/.local/share/gnome-shell/extensions/claude-usage-checker@gnome/get-usage.py`

## Files

- `extension.js` - Main GNOME extension code
- `get-usage.py` - Python script that runs `/usage` and parses output
- `metadata.json` - Extension metadata
- `stylesheet.css` - Styling for the panel label
- `README.md` - This file

## Notes

- Usage data refreshes automatically every 5 minutes
- The panel shows the highest percentage among all models
- Progress bars use Unicode block characters for visual representation
