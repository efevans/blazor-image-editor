using Balzor8WebApp.Shared.Data;
using Balzor8WebApp.Shared.Entity;
using Microsoft.EntityFrameworkCore;

namespace Balzor8WebApp.Shared.Service
{
    public class ProjectService(DataContext context) : IProjectService
    {
        private readonly DataContext Context = context;

        public async Task<List<Project>> GetProjects()
        {
            var projects = await Context.Projects.ToListAsync();
            return projects;
        }
    }
}
