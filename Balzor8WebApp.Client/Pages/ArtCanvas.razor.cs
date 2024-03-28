using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;

namespace Balzor8WebApp.Client.Pages
{
    [SupportedOSPlatform("browser")]
    public partial class ArtCanvas
    {
        [JSImport("consoleLog", "ArtCanvas")]
        internal static partial void Log(string msg);

        [JSImport("consoleLog2", "ArtCanvas")]
        internal static partial void Log2(string serializedStr);

        [JSImport("saveImage", "ArtCanvas")]
        internal static partial void SaveImage(string canvasId);

        [JSImport("resetImage", "ArtCanvas")]
        internal static partial void ResetImage(string canvasId, string cleanCanvasId);

        //[JSImport("applyDither", "ArtCanvas")]
        //public static partial void ApplyFloydSteinbergDither(string canvasId);

        //[JSImport("applyOrderedDither", "ArtCanvas")]
        //public static partial void ApplyOrderedDither(string canvasId);

        //[JSImport("applyInvert", "ArtCanvas")]
        //public static partial void ApplyInvert(string canvasId);

        //[JSImport("applyGammaCorrection", "ArtCanvas")]
        //public static partial void ApplyGammaCorrection(string canvasId);

        //[JSImport("applyPixelate", "ArtCanvas")]
        //public static partial void ApplyPixelate(string canvasId);
    }
}
