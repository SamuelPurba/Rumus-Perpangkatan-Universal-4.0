using System;
using System.IO;
using System.Net;
using System.Text;
using System.Diagnostics;
using System.Reflection;
using System.Threading;

class Program {
    static string GetEmbeddedFile(string name) {
        try {
            var assembly = Assembly.GetExecutingAssembly();
            var resourceName = "SamuelAI." + name;
            using (Stream stream = assembly.GetManifestResourceStream(resourceName)) {
                if (stream == null) return "";
                using (StreamReader reader = new StreamReader(stream, Encoding.UTF8)) {
                    return reader.ReadToEnd();
                }
            }
        } catch {
            return "";
        }
    }

    static void Main(string[] args) {
        int port = 3000;
        HttpListener listener = null;
        bool started = false;

        // Dynamic port search from 3000 to 3015 to prevent socket collision
        for (int p = 3000; p <= 3015; p++) {
            try {
                listener = new HttpListener();
                listener.Prefixes.Add("http://localhost:" + p + "/");
                listener.Start();
                port = p;
                started = true;
                break;
            } catch {
                if (listener != null) {
                    try { listener.Close(); } catch {}
                }
            }
        }

        if (!started || listener == null) {
            Console.WriteLine("Gagal menjalankan server pada port 3000-3015.");
            Console.WriteLine("Tekan Enter untuk keluar...");
            Console.ReadLine();
            return;
        }

        try {
            Console.Title = "Samuel.A.I Server - Rumus Perpangkatan Universal 4.0";
            Console.Clear();
            Console.ForegroundColor = ConsoleColor.Cyan;
        } catch {}
        Console.WriteLine("==============================================================");
        Console.WriteLine("    SAMUEL.A.I - RUMUS PERPANGKATAN UNIVERSAL 4.0 SERVER");
        Console.WriteLine("==============================================================");
        try {
            Console.ResetColor();
        } catch {}
        Console.WriteLine(" Server berhasil dijalankan tanpa error!");
        Console.WriteLine(" Silakan akses aplikasi melalui peramban (browser) di:");
        try {
            Console.ForegroundColor = ConsoleColor.Green;
        } catch {}
        Console.WriteLine(" --> http://localhost:" + port + "/");
        try {
            Console.ResetColor();
        } catch {}
        Console.WriteLine("==============================================================");
        Console.WriteLine(" Membuka peramban otomatis...");
        
        string targetUrl = "http://localhost:" + port + "/";
        try {
            ProcessStartInfo psi = new ProcessStartInfo {
                FileName = targetUrl,
                UseShellExecute = true
            };
            Process.Start(psi);
        } catch {
            try {
                Process.Start("cmd", "/c start " + targetUrl);
            } catch {}
        }

        ThreadPool.QueueUserWorkItem((o) => {
            while (listener.IsListening) {
                try {
                    HttpListenerContext context = listener.GetContext();
                    HttpListenerRequest request = context.Request;
                    HttpListenerResponse response = context.Response;

                    string path = request.Url.LocalPath.TrimStart('/');
                    if (string.IsNullOrEmpty(path)) path = "index.html";

                    byte[] buffer = null;
                    string contentType = "text/html; charset=utf-8";

                    path = Uri.UnescapeDataString(path);

                    if (File.Exists(path)) {
                        buffer = File.ReadAllBytes(path);
                        string ext = Path.GetExtension(path).ToLowerInvariant();
                        switch (ext) {
                            case ".html": case ".htm": contentType = "text/html; charset=utf-8"; break;
                            case ".js": contentType = "application/javascript; charset=utf-8"; break;
                            case ".css": contentType = "text/css; charset=utf-8"; break;
                            case ".pdf": contentType = "application/pdf"; break;
                            case ".docx": contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; break;
                            case ".png": contentType = "image/png"; break;
                            case ".jpg": case ".jpeg": contentType = "image/jpeg"; break;
                            case ".svg": contentType = "image/svg+xml"; break;
                            case ".json": contentType = "application/json"; break;
                            case ".ico": contentType = "image/x-icon"; break;
                            case ".md": contentType = "text/markdown; charset=utf-8"; break;
                            default: contentType = "application/octet-stream"; break;
                        }
                    } else if (path == "index.html" || path == "app.js" || path == "style.css") {
                        string embedded = GetEmbeddedFile(path);
                        if (!string.IsNullOrEmpty(embedded)) {
                            buffer = Encoding.UTF8.GetBytes(embedded);
                            if (path == "index.html") contentType = "text/html; charset=utf-8";
                            else if (path == "app.js") contentType = "application/javascript; charset=utf-8";
                            else if (path == "style.css") contentType = "text/css; charset=utf-8";
                        }
                    } else {
                        // Check local directory files (images, docs, pdfs)
                        if (File.Exists(path)) {
                            buffer = File.ReadAllBytes(path);
                            string ext = Path.GetExtension(path).ToLowerInvariant();
                            switch (ext) {
                                case ".pdf": contentType = "application/pdf"; break;
                                case ".docx": contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"; break;
                                case ".png": contentType = "image/png"; break;
                                case ".jpg":
                                case ".jpeg": contentType = "image/jpeg"; break;
                                case ".svg": contentType = "image/svg+xml"; break;
                                case ".json": contentType = "application/json"; break;
                                case ".ico": contentType = "image/x-icon"; break;
                                default: contentType = "application/octet-stream"; break;
                            }
                        }
                    }

                    if (buffer != null) {
                        response.ContentType = contentType;
                        response.ContentLength64 = buffer.Length;
                        response.OutputStream.Write(buffer, 0, buffer.Length);
                    } else {
                        response.StatusCode = 404;
                    }
                    response.OutputStream.Close();
                } catch {}
            }
        });

        Console.WriteLine("\n [Petunjuk] Tekan tombol ENTER pada jendela ini untuk mematikan server...");
        try {
            string input = Console.ReadLine();
            if (input == null) {
                while (listener.IsListening) {
                    Thread.Sleep(5000);
                }
            }
        } catch {
            while (listener.IsListening) {
                Thread.Sleep(5000);
            }
        }
        try { listener.Stop(); } catch {}
    }
}

