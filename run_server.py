#!/usr/bin/env python3
import http.server
import os
import sys

PORT = 8000

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404:
            self.path = 'index.html'
            return self.do_GET()
        super().send_error(code, message, explain)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        PORT = int(sys.argv[1])
    os.chdir(os.path.join(os.path.dirname(__file__), 'build'))
    http.server.HTTPServer(('', PORT), SPAHandler).serve_forever()
