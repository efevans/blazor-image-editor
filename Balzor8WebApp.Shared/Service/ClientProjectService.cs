using Balzor8WebApp.Shared.Entity;
using System.Net.Http.Json;

namespace Balzor8WebApp.Shared.Service
{
    public class ClientProjectService(HttpClient httpClient) : IProjectService
    {
        private readonly HttpClient _httpClient = httpClient;

        public async Task<List<Project>> GetProjects()
        {
            var projects = await _httpClient.GetFromJsonAsync<List<Project>>("/api/project");
            return projects ?? [];
        }
    }
}
