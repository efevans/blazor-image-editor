using Microsoft.AspNetCore.Components;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;

namespace Balzor8WebApp.Client.Pages;

[SupportedOSPlatform("browser")]
public partial class InteropTest
{
    [JSImport("getMessage", "InteropTest")]
    internal static partial string GetWelcomeMessage();
    [JSImport("changeText", "InteropTest")]
    internal static partial string ChangeText(string id);
}