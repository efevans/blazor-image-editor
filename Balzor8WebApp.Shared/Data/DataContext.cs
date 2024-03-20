using Balzor8WebApp.Shared.Entity;
using Microsoft.EntityFrameworkCore;

namespace Balzor8WebApp.Shared.Data
{
    public class DataContext(DbContextOptions<DataContext> options) : DbContext(options)
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Project>().HasData(
                new Project { Id = 1, Title = "SuperRun", Description = "Infinite Runner in Godot", GithubUrl = "/efevans/town-sell", ItchIoUrl = "https://imbajoe.itch.io/play-the-mind", ImageSrc = "test.png" }
            );
        }

        public DbSet<Project> Projects { get; set; }
    }
}
