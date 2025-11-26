# Claude Code Usage Monitor

A GNOME Shell extension that displays your Claude Code token usage directly in your system panel. Monitor your session and weekly token consumption at a glance with visual progress bars and status indicators.

## Features

- **Real-time Usage Monitoring**: Track your Claude Code token usage in the GNOME panel
- **Session & Weekly Limits**: View both current session and weekly usage percentages
- **Visual Progress Bars**: Easy-to-read progress bars showing consumption levels
- **Smart Status Icons**: Icons change based on usage levels
  - Happy (below 80%)
  - Warning (80-99%)
  - Alert (100% or maxed out)
- **Auto-refresh**: Automatically updates every 5 minutes
- **Manual Refresh**: Click to refresh usage data on demand
- **Reset Timers**: See when your session and weekly limits reset

## Screenshots

The extension shows:
- Percentage indicator in the panel
- Dropdown menu with detailed session and weekly usage
- Progress bars for visual representation
- Next reset times for both session and weekly limits

## Requirements

- GNOME Shell 42, 45, or 46
- Python 3
- `pexpect` Python library
- Claude Code CLI installed and configured

## Installation

### 1. Install Python Dependencies

```bash
pip install pexpect
```

### 2. Install the Extension

Clone this repository to your GNOME extensions directory:

```bash
git clone https://github.com/yourusername/claude-usage-checker.git \
  ~/.local/share/gnome-shell/extensions/claude-usage-checker@DiogoValdrez.github.com
```

### 3. Enable the Extension

Restart GNOME Shell:
- On X11: Press `Alt+F2`, type `r`, and press Enter
- On Wayland: Log out and log back in

Then enable the extension:

```bash
gnome-extensions enable claude-usage-checker@DiogoValdrez.github.com
```

Or use GNOME Extensions app to enable it.

## How It Works

The extension runs a Python script (`get-usage.py`) that:
1. Launches Claude Code CLI with the `/usage` command
2. Parses the usage information
3. Returns formatted JSON data
4. Updates the panel display

The extension displays:
- **Panel Icon**: Shows usage status with emoji indicators
- **Percentage**: Current weekly usage percentage
- **Session Usage**: Tokens used in current session with reset time
- **Weekly Usage**: Tokens used this week with reset date

## Configuration

The extension auto-refreshes every 5 minutes (300 seconds). To modify this:

Edit `extension.js:203` and change the timeout value:
```javascript
this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 300, () => {
```

## Troubleshooting

### Extension shows "ERR"

1. Check that Claude Code CLI is installed: `which claude`
2. Verify Python 3 is available: `python3 --version`
3. Ensure pexpect is installed: `pip show pexpect`
4. Check extension logs: `journalctl -f -o cat /usr/bin/gnome-shell`

### Script permissions

The script uses `--dangerously-skip-permissions` to avoid interactive prompts. Ensure your Claude Code setup allows this.

### Manual testing

Test the Python script directly:
```bash
python3 ~/.local/share/gnome-shell/extensions/claude-usage-checker@DiogoValdrez.github.com/get-usage.py
```

## Development

### File Structure

- `extension.js`: Main extension code (GNOME Shell integration)
- `get-usage.py`: Python script that fetches usage from Claude CLI
- `metadata.json`: Extension metadata
- `stylesheet.css`: Custom styles for the panel widget

### Debugging

View real-time logs:
```bash
journalctl -f -o cat /usr/bin/gnome-shell | grep -i claude
```

### Making Changes

After modifying the extension, restart GNOME Shell to see changes.

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built for the Claude Code CLI by Anthropic
- Uses GNOME Shell Extension APIs
- Python pexpect library for CLI interaction
