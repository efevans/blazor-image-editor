﻿
using static Balzor8WebApp.Client.Pages.ArtCanvas;

namespace Balzor8WebApp.Client.ImagePostProcessing
{
    public class NoOpPostProcessor : IPostProcesser
    {
        public byte[] Process(byte[] _bytes, int _width, int _height, Dictionary<string, CanvasEffectOption> _options)
        {
            return _bytes;
        }
    }
}
