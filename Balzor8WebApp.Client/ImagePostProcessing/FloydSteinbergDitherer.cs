using Balzor8WebApp.Client.Pages;

namespace Balzor8WebApp.Client.ImagePostProcessing
{
    public class FloydSteinbergDitherer : IPostProcesser
    {
        public byte[] Process(byte[] bytes, int width, int height, Dictionary<string, ArtCanvas.CanvasEffectOption> optionsDict)
        {
            var options = ParseOptions(optionsDict);
            var corrections = new float[bytes.Length];

            if (options.Grayscale)
            {
                for (int i = 0; i < bytes.Length; i += 4)
                {
                    bytes[i + 0] = 127;
                }
                return bytes;
                Console.WriteLine("Starting Grayscale dither");
                return ApplyGrayscaleDither(bytes, width, height, corrections, options);
            }
            return bytes;
        }

        private const float RightNeighborRatio = 7.0f / 16.0f;
        private const float BottomLeftNeighborRatio = 3.0f / 16.0f;
        private const float BottomNeighborRatio = 5.0f / 16.0f;
        private const float BottomRightNeighborRatio = 1.0f / 16.0f;

        private static byte[] ApplyGrayscaleDither(byte[] bytes, int width, int height, float[] corrections, Options options)
        {
            void AccrueError(int x, int y, int xOffset, int yOffset, float[] corrections, float accruedCorrection, float correctionRatio)
            {
                int index = GetIndexForCoordinates(x + xOffset, y + yOffset, width);
                AccrueErrorForIndex(corrections, index, accruedCorrection, correctionRatio);
            }

            int halfway = width * height * 2;
            halfway -= (halfway % 4);

            for (int i = 0; i < bytes.Length; i += 4)
            {
                //if (i == halfway)
                //{
                //    Console.WriteLine("Halfway through bytes");
                //}
                float colorAvg = (bytes[i + 0] + bytes[i + 1] + bytes[i + 2]) / 3.0f;
                bytes[i + 0] = bytes[i + 1] = bytes[i + 2] = (byte)colorAvg;
                continue;
                var (greyValue, correction) = GetClosestValueWithError(colorAvg, corrections[i + 0], options.ColorStep);
                bytes[i + 0] = bytes[i + 1] = bytes[i + 2] = greyValue;
                var (x, y) = GetCoordinatesForIndex(i, width);

                if (!CoordinateIsOnRightEdge(x, width))
                {
                    AccrueError(x, y, 1, 0, corrections, correction, RightNeighborRatio);
                }
                if (!CoordinateIsOnLeftEdge(x) && !CoordinateIsOnBottomEdge(y, height))
                {
                    AccrueError(x, y, -1, 1, corrections, correction, BottomLeftNeighborRatio);
                }
                if (!CoordinateIsOnBottomEdge(y, height))
                {
                    AccrueError(x, y, 0, 1, corrections, correction, BottomNeighborRatio);
                }
                if (!CoordinateIsOnRightEdge(x, width) && !CoordinateIsOnBottomEdge(y, height))
                {
                    AccrueError(x, y, 0, 1, corrections, correction, BottomRightNeighborRatio);
                }
            }

            return bytes;
        }

        private record Options(bool Grayscale, int ColorBits, int ColorStep);

        private static Options ParseOptions(Dictionary<string, ArtCanvas.CanvasEffectOption> optionsDict)
        {
            bool grayscale = optionsDict["grayscale"].BinaryValue;
            int colorBits = optionsDict["colorBits"].Value;
            int colorStep = (int)(256f / colorBits);

            return new(grayscale, colorBits, colorStep);
        }

        private static (byte, float) GetClosestValueWithError(float value, float correction, int colorStep)
        {
            var correctedValue = value + correction;
            var normalizedValue = (correctedValue + 1) / colorStep;
            var roundedTotal = (int)Math.Round(normalizedValue);
            var unnormalizedRGB = roundedTotal * colorStep;
            var clampedRGB = (byte)Math.Max(0, Math.Min(255, unnormalizedRGB));
            return (clampedRGB, correctedValue - clampedRGB);
        }

        private static void AccrueErrorForIndex(float[] errorsArray, int index, float addedValue, float correctionRatio)
        {
            errorsArray[index] = errorsArray[index] + (addedValue * correctionRatio);
        }

        private static int GetIndexForCoordinates(int x, int y, int width)
        {
            return (x + (y * width)) * 4;
        }

        private static (int, int) GetCoordinatesForIndex(int index, int width)
        {
            var x = (index % (width * 4)) / 4;
            var y = (index - (x * 4)) / (width * 4);
            return (x, y);
        }

        private static bool CoordinateIsOnLeftEdge(int x) => x == 0;

        private static bool CoordinateIsOnRightEdge(int x, int width) => x + 1 == width;

        private static bool CoordinateIsOnBottomEdge(int y, int height) => y + 1 == height;
    }
}
