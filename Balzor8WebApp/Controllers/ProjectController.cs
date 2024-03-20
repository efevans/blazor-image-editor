using Balzor8WebApp.Shared.Entity;
using Balzor8WebApp.Shared.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Balzor8WebApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController(IProjectService projectService) : ControllerBase
    {
        private readonly IProjectService _projectService = projectService;

        [HttpGet]
        [ProducesResponseType<Project>(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<Project>>> GetAll()
        {
            var projects = await _projectService.GetProjects();
            
            return Ok(projects);
        }
    }
}
