using Balzor8WebApp.Shared.Service;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using MudBlazor.Services;

namespace Balzor8WebApp.Client
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);

            builder.Services.AddScoped(http => new HttpClient
            {
                BaseAddress = new Uri(builder.HostEnvironment.BaseAddress),
            });
            builder.Services.AddMudServices();
            builder.Services.AddScoped<IProjectService, ClientProjectService>();

            await builder.Build().RunAsync();
        }
    }
}
