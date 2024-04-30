namespace Balzor8WebApp.Client.ImagePostProcessing
{
    public static class CommonProcessingMethods
    {
        public static void GetCoordinatesForIndex(int index, int width, out int x, out int y)
        {
            x = (index % (width * 4)) / 4;
            y = (index - (x * 4)) / (width * 4);
        }

        public static int GetIndexForCoordinates(int x, int y, int width)
        {
            return (x + (y * width)) * 4;
        }
    }
}
