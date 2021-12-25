using ServiceBusMonitor.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<IApiCollection, ApiCollection>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Client/Error/Index");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.MapControllerRoute(
    name: "client",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

app.Run();
