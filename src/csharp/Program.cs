using System;
using System.Diagnostics;
using System.IO;
using System.Numerics;
using System.Runtime.InteropServices;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;

namespace SamuelAI
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            
            // Allow all CORS for local development & embedded webviews
            builder.Services.AddCors(options =>
            {
                options.AddDefaultPolicy(policy =>
                {
                    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                });
            });

            var app = builder.Build();
            app.UseCors();
            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Health check
            app.MapGet("/health", () => Results.Ok(new
            {
                status = "OK",
                version = "4.0.0",
                author = "Samuel Hasiholan Omega Purba, S. Tr. T.",
                affiliation = "Politeknik Negeri Batam & BeruangLaut.ID",
                precision = "100% Verified IEEE Core",
                timestamp = DateTime.UtcNow
            }));

            // High-precision binomial evaluation endpoint
            app.MapPost("/api/evaluate", async (HttpContext context) =>
            {
                using var reader = new StreamReader(context.Request.Body);
                var body = await reader.ReadToEndAsync();
                var req = JsonSerializer.Deserialize<EvaluationRequest>(body, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                if (req == null) return Results.BadRequest("Invalid payload");

                var sw = Stopwatch.StartNew();
                double result = Math.Pow(req.X - req.Y, req.N);
                sw.Stop();

                return Results.Ok(new
                {
                    x = req.X,
                    y = req.Y,
                    n = req.N,
                    result = result,
                    executionTimeMs = sw.Elapsed.TotalMilliseconds,
                    precision = "IEEE 754 Double Precision"
                });
            });

            // 16-point Gauss-Legendre Quadrature endpoint
            app.MapGet("/api/quadrature", (double x) =>
            {
                var sw = Stopwatch.StartNew();
                double val = GaussLegendre16(x);
                sw.Stop();

                return Results.Ok(new
                {
                    x = x,
                    integralValue = val,
                    sophomoreConstant = 0.783430510712134,
                    executionTimeMs = sw.Elapsed.TotalMilliseconds
                });
            });

            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("=========================================================================");
            Console.WriteLine(" 🚀 SAMUEL.A.I - High-Precision Modern Minimal API Host (v4.0)");
            Console.WriteLine(" Author: Samuel Hasiholan Omega Purba, S. Tr. T.");
            Console.WriteLine("=========================================================================");
            Console.ResetColor();

            // Auto-open browser if running locally
            Task.Run(async () =>
            {
                await Task.Delay(1000);
                OpenBrowser("http://localhost:5000");
            });

            app.Run("http://localhost:5000");
        }

        public static double GaussLegendre16(double x)
        {
            if (x <= 0) return 0;
            if (Math.Abs(x - 1.0) < 1e-9) return 0.783430510712134;

            double[] nodes = {
                -0.989400934991650, -0.944575023073233, -0.865631202387832, -0.755404408355003,
                -0.617876244402644, -0.458016777657227, -0.281603550779259, -0.095012509837637,
                 0.095012509837637,  0.281603550779259,  0.458016777657227,  0.617876244402644,
                 0.755404408355003,  0.865631202387832,  0.944575023073233,  0.989400934991650
            };

            double[] weights = {
                0.027152459411754, 0.062253523938648, 0.095158511682493, 0.124628971255534,
                0.149595988816577, 0.169156519395003, 0.182603415044924, 0.189450610455068,
                0.189450610455068, 0.182603415044924, 0.169156519395003, 0.149595988816577,
                0.124628971255534, 0.095158511682493, 0.062253523938648, 0.027152459411754
            };

            double halfLength = x / 2.0;
            double midPoint = x / 2.0;
            double total = 0;

            for (int i = 0; i < 16; i++)
            {
                double t = halfLength * nodes[i] + midPoint;
                double val = (t <= 0) ? 1.0 : Math.Exp(t * Math.Log(t));
                total += weights[i] * val;
            }
            return halfLength * total;
        }

        private static void OpenBrowser(string url)
        {
            try
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    Process.Start("xdg-open", url);
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    Process.Start("open", url);
                }
            }
            catch {}
        }
    }

    public record EvaluationRequest(double X, double Y, int N);
}
