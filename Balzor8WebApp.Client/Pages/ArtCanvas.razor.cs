using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;

namespace Balzor8WebApp.Client.Pages
{
    [SupportedOSPlatform("browser")]
    public partial class Canvas
    {
        [JSImport("consoleLog", "Canvas")]
        internal static partial void Log();

        [JSImport("getMessage", "Canvas")]
        internal static partial void GetMessage();
    }
}
