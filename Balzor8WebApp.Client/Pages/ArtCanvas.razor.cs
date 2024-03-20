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

        [JSImport("uploadImage", "ArtCanvas")]
        internal static partial void UploadImage(string inputFileId, string canvasId, string cleanCanvasId);

        [JSImport("saveImage", "ArtCanvas")]
        internal static partial void SaveImage(string canvasId);

        [JSImport("resetImage", "ArtCanvas")]
        internal static partial void ResetImage(string canvasId, string cleanCanvasId);

        [JSImport("applyDither", "ArtCanvas")]
        internal static partial void ApplyDither(string canvasId);

        [JSImport("applyInvert", "ArtCanvas")]
        internal static partial void ApplyInvert(string canvasId);

        [JSImport("applyHalfInvert", "ArtCanvas")]
        internal static partial void ApplyHalfInvert(string canvasId);

        [JSImport("applyGammaCorrection", "ArtCanvas")]
        internal static partial void ApplyGammaCorrection(string canvasId);

        [JSImport("applyPixelate", "ArtCanvas")]
        internal static partial void ApplyPixelate(string canvasId);
    }
}
