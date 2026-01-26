import sys
import json
import subprocess
import time

def test_mcp():
    process = subprocess.Popen(
        ['/opt/homebrew/bin/notebooklm-mcp'],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    def send(method, params=None, id=None):
        msg = {"jsonrpc": "2.0", "method": method}
        if params is not None: msg["params"] = params
        if id is not None: msg["id"] = id
        process.stdin.write(json.dumps(msg) + "\n")
        process.stdin.flush()

    def receive():
        while True:
            line = process.stdout.readline()
            if not line: return None
            try:
                data = json.loads(line)
                if "jsonrpc" in data: return data
            except json.JSONDecodeError: continue

    send("initialize", {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "Test", "version": "1"}}, id=1)
    receive()
    send("notifications/initialized")
    
    # List notebooks
    send("tools/call", {"name": "notebook_list", "arguments": {}}, id=2)
    print(json.dumps(receive(), indent=2))

    process.stdin.close()
    process.terminate()

if __name__ == "__main__":
    test_mcp()
