#!/usr/bin/env python3
"""
Get Claude Code usage information by running /usage command
"""
import sys
import json
import re

try:
    import pexpect
except ImportError:
    print(json.dumps({'error': 'pexpect not installed. Run: pip install pexpect'}), file=sys.stderr)
    sys.exit(1)

def strip_ansi(text):
    """Remove ANSI escape sequences"""
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text)

def get_claude_usage():
    """Run claude with /usage command and parse output"""
    try:
        # Spawn claude with --dangerously-skip-permissions flag
        child = pexpect.spawn('claude /usage --dangerously-skip-permissions', timeout=10, encoding='utf-8')
        
        # Wait for initial prompt
        child.expect([pexpect.TIMEOUT], timeout=2)
        
        # Send /usage command
        #child.sendline('/usage')
        
        # Wait for usage output
        child.expect([pexpect.TIMEOUT], timeout=3)
        
        # Send Escape to exit usage view
        child.send('\x1b')  # ESC key
        
        # Wait a bit
        child.expect([pexpect.TIMEOUT], timeout=1)
        
        # Send /exit to quit
        child.sendline('/exit')
        
        # Get all output and strip ANSI codes
        output = child.before if child.before else ""
        output = strip_ansi(output)
        
        #print("=== RAW OUTPUT START ===", file=sys.stderr)
        #print(output, file=sys.stderr)
        #print("=== RAW OUTPUT END ===", file=sys.stderr)
        
        # Parse the output format
        usage_data = {
            'session_percent': 0,
            'session_reset_time': '',
            'weekly_percent': 0,
            'weekly_reset_date': '',
        }
        
        lines = output.split('\n')
        for i, line in enumerate(lines):
            if 'Current session' in line:
                for j in range(i+1, min(i+3, len(lines))):
                    percent_match = re.search(r'(\d+)%\s+used', lines[j])
                    if percent_match:
                        usage_data['session_percent'] = int(percent_match.group(1))
                    reset_match = re.search(r'Resets\s+(.+)', lines[j])
                    if reset_match:
                        # Clean up the reset time string
                        reset_time = reset_match.group(1).strip()
                        # Remove anything in parentheses
                        reset_time = re.sub(r'\s*\([^)]*\)', '', reset_time)
                        usage_data['session_reset_time'] = reset_time
            
            elif 'Current week' in line:
                for j in range(i+1, min(i+3, len(lines))):
                    percent_match = re.search(r'(\d+)%\s+used', lines[j])
                    if percent_match:
                        usage_data['weekly_percent'] = int(percent_match.group(1))
                    reset_match = re.search(r'Resets\s+(.+)', lines[j])
                    if reset_match:
                        # Clean up the reset date string
                        reset_date = reset_match.group(1).strip()
                        # Remove anything in parentheses
                        reset_date = re.sub(r'\s*\([^)]*\)', '', reset_date)
                        usage_data['weekly_reset_date'] = reset_date
        
        print(json.dumps(usage_data, indent=2))
        return 0
        
    except Exception as e:
        import traceback
        print(json.dumps({'error': str(e), 'traceback': traceback.format_exc()}), file=sys.stderr)
        return 1

if __name__ == '__main__':
    sys.exit(get_claude_usage())

