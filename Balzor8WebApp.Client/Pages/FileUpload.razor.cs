using System.Runtime.InteropServices.JavaScript;

namespace Balzor8WebApp.Client.Pages
{
    public partial class FileUpload
    {
        [JSImport("GetPixelDataFromCanvas", "FileUpload")]
        internal static partial byte[] GetBytes(string canvasId);

        [JSImport("SetPixelDataToCanvas", "FileUpload")]
        internal static partial void SetBytes(string canvasId, byte[] bytes);
    }
}
