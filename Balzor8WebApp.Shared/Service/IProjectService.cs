using Balzor8WebApp.Shared.Entity;

namespace Balzor8WebApp.Shared.Service
{
    public interface IProjectService
    {
        Task<List<Project>> GetProjects();
    }
}
