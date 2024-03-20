using Microsoft.CSharp;

namespace Balzor8WebApp.Shared.Entity
{
    public class Project
    {
        public int Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string ImageSrc { get; set; } = null!;
        public string GithubUrl { get; set; } = null!;
        public string ItchIoUrl { get; set; } = null!;
    }
}
