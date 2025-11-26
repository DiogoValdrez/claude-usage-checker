const { GObject, St, Gio, GLib, Clutter } = imports.gi;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Extension = Me.imports.extension.Extension;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const _ = imports.gettext.domain('gnome-shell-extensions').gettext;

const ClaudeUsageIndicator = GObject.registerClass(
class ClaudeUsageIndicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Claude Code Usage'));
        this._extensionPath = Me.path;
        this._scriptPath = GLib.build_filenamev([this._extensionPath, 'get-usage.py']);

        this._icon = new St.Label({
            text: '🤔',
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'system-status-icon',
        });
        this.add_child(this._icon);

        this._usageLabel = new St.Label({
            text: _('...'),
            y_align: Clutter.ActorAlign.CENTER,
            style_class: 'claude-usage-label'
        });
        this.add_child(this._usageLabel);

        // Refresh button
        this._refreshItem = new PopupMenu.PopupMenuItem(_('Refresh'));
        this._refreshItem.connect('activate', () => {
            this._fetchUsage();
        });
        this.menu.addMenuItem(this._refreshItem);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Title
        let titleBox = new St.BoxLayout({
            style: 'padding: 6px 12px;'
        });
        let titleLabel = new St.Label({
            text: 'Claude Usage',
            style: 'font-weight: bold;'
        });
        titleBox.add_child(titleLabel);
        let titleItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false,
        });
        titleItem.actor.add_child(titleBox);
        this.menu.addMenuItem(titleItem);
        
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Session info - plain text, no underlines
        let sessionBox = new St.BoxLayout({
            vertical: true,
            style: 'padding: 8px 12px;'
        });
        this._sessionLabel = new St.Label({
            text: 'Session: Loading...',
            style: 'font-family: monospace;'
        });
        this._sessionLabel.clutter_text.set_use_markup(false);
        this._sessionLabel.clutter_text.set_selectable(false);
        sessionBox.add_child(this._sessionLabel);
        
        let sessionItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false,
            activate: false,
        });
        sessionItem.actor.add_child(sessionBox);
        this.menu.addMenuItem(sessionItem);

        // Weekly info - plain text, no underlines
        let weeklyBox = new St.BoxLayout({
            vertical: true,
            style: 'padding: 8px 12px;'
        });
        this._weeklyLabel = new St.Label({
            text: 'Weekly: Loading...',
            style: 'font-family: monospace;'
        });
        this._weeklyLabel.clutter_text.set_use_markup(false);
        this._weeklyLabel.clutter_text.set_selectable(false);
        weeklyBox.add_child(this._weeklyLabel);
        
        let weeklyItem = new PopupMenu.PopupBaseMenuItem({
            reactive: false,
            can_focus: false,
            activate: false,
        });
        weeklyItem.actor.add_child(weeklyBox);
        this.menu.addMenuItem(weeklyItem);

        this._fetchUsage();
        this._startAutoRefresh();
    }


    
    _fetchUsage() {
        this._usageLabel.set_text('...');

        try {
            const proc = Gio.Subprocess.new(
                ['python3', this._scriptPath],
                Gio.SubprocessFlags.STDOUT_PIPE | Gio.SubprocessFlags.STDERR_PIPE
            );

            proc.communicate_utf8_async(null, null, (proc, res) => {
                try {
                    const [, stdout, stderr] = proc.communicate_utf8_finish(res);

                    if (proc.get_successful()) {
                        this._parseUsageData(stdout);
                    } else {
                        this._usageLabel.set_text('ERR');
                        this._sonnetItem.label.set_text('Failed to fetch usage');
                        logError(new Error(stderr), 'Claude usage script failed');
                    }
                } catch (e) {
                    logError(e, 'Failed to parse usage data');
                    this._usageLabel.set_text('ERR');
                }
            });
        } catch (e) {
            logError(e, 'Failed to run usage script');
            this._usageLabel.set_text('ERR');
        }
    }

   _parseUsageData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.error) {
                this._usageLabel.set_text('ERR');
                this._sessionLabel.set_text(`Error: ${data.error}`);
                this._weeklyLabel.set_text('');
                this._icon.set_text('✗');  // Error icon
                return;
            }
            
            const weeklyPercent = data.weekly_percent || 0;
            const sessionPercent = data.session_percent || 0;
            
            // Change icon based on session usage
            if (sessionPercent >= 100) {
                this._icon.set_text('ʕノ•ᴥ•ʔノ ︵ ┻━┻');  // Disapproval look when maxed out
                // Or other options:
                // this._icon.set_text('💀');  // Skull
                // this._icon.set_text('🔥');  // Fire
                // this._icon.set_text('⚠️');   // Warning
                // this._icon.set_text('😱');  // Scared face
            } else if (sessionPercent >= 80) {
                this._icon.set_text('ಠ_ಠ');  // Warning look
            } else {
                this._icon.set_text('🥳');  // Happy look
                // Or other options:
                // this._icon.set_text('🤖');  // Robot
                // this._icon.set_text('✓');   // Check mark
                // this._icon.set_text('◕_◕'); // Neutral
            }
            
            this._usageLabel.set_text(`${weeklyPercent}%`);
            
            const formatBar = (percent) => {
                const barLength = 20;
                const filled = Math.round((percent / 100) * barLength);
                // const bar = '●'.repeat(filled) + '○'.repeat(barLength - filled);
                const bar = '▰'.repeat(filled) + '▱'.repeat(barLength - filled);
                return `${bar}`;
            };
            
            this._sessionLabel.set_text(
                `Session: ${sessionPercent}% used\n${formatBar(sessionPercent)}\nResets: ${data.session_reset_time}`
            );
            
            this._weeklyLabel.set_text(
                `Weekly: ${weeklyPercent}% used\n${formatBar(weeklyPercent)}\nResets: ${data.weekly_reset_date}`
            );
            
        } catch (e) {
            logError(e, 'Failed to parse JSON usage data');
            this._usageLabel.set_text('ERR');
            this._sessionLabel.set_text('Failed to parse data');
            this._icon.set_text('✗');
        }
    }


    _startAutoRefresh() {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
        }

        this._timeoutId = GLib.timeout_add_seconds(GLib.PRIORITY_DEFAULT, 300, () => {
            this._fetchUsage();
            return GLib.SOURCE_CONTINUE;
        });
    }

    destroy() {
        if (this._timeoutId) {
            GLib.Source.remove(this._timeoutId);
            this._timeoutId = null;
        }
        super.destroy();
    }
});

let claudeUsageIndicator;

function init() {
    // Initialization logic if needed
}

function enable() {
    claudeUsageIndicator = new ClaudeUsageIndicator();
    Main.panel.addToStatusArea('claude-usage', claudeUsageIndicator);
}

function disable() {
    if (claudeUsageIndicator) {
        claudeUsageIndicator.destroy();
        claudeUsageIndicator = null;
    }
}

