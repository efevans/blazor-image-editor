using static Balzor8WebApp.Client.Pages.ArtCanvas;

namespace Balzor8WebApp.Client.ImagePostProcessing
{
    public interface IPostProcesser
    {
        /// <summary>
        /// Applies some post processing effect to the passed in byte array.
        /// </summary>
        /// <param name="bytes"></param>
        /// <param name="options"></param>
        /// <returns></returns>
        byte[] Process(byte[] bytes, Dictionary<string, CanvasEffectOption> options);
    }
}
