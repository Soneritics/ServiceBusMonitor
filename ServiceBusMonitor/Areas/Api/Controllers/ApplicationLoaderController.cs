using Microsoft.AspNetCore.Mvc;
using ServiceBusMonitor.Api;
using ServiceBusMonitor.Api.Apis;
using ServiceBusMonitor.Api.Exceptions;
using ServiceBusMonitor.Areas.Api.Exceptions;
using ServiceBusMonitor.Areas.Api.Models;
using ServiceBusMonitor.Models.Configuration;

namespace ServiceBusMonitor.Areas.Api.Controllers
{
    [Area("Api")]
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationLoaderController : ApiControllerBase
    {
        private static bool _isConfiguredOrConfiguring;
        private static LoaderStatusModel _status = new ("Warming up");
        private readonly IConfiguration _configuration;

        private static readonly SemaphoreSlim SemaphoreSlim = new(1, 1);

        public ApplicationLoaderController(
            IApiCollection apiCollection,
            IConfiguration configuration)
            : base(apiCollection)
        {
            _configuration = configuration;
        }

        [HttpGet("Status")]
        public IActionResult Status()
        {
            return new JsonResult(_status);
        }

        [HttpGet]
        public async Task<IActionResult> LoadAsync()
        {
            await SemaphoreSlim.WaitAsync();

            try
            {
                if (!_isConfiguredOrConfiguring)
                {
                    _isConfiguredOrConfiguring = true;
                    await ConfigureAsync();
                }
            }
            catch (CouldNotBindConfigurationException)
            {
                _status = new LoaderStatusModel("Cannot bind configuration. Please review the app settings.")
                {
                    LoaderStatusType = LoaderStatusType.Error
                };
            }
            catch (NoBusConfigurationsFoundException)
            {
                _status = new LoaderStatusModel("No service bus configuration found. Please review the app settings.")
                {
                    LoaderStatusType = LoaderStatusType.Error
                };
            }
            catch (NoNameForAppConfigurationValueException)
            {
                _status = new LoaderStatusModel("Service bus name is missing. Please review the app settings.")
                {
                    LoaderStatusType = LoaderStatusType.Error
                };
            }
            catch (NoActualBusConfigurationException ex)
            {
                _status = new LoaderStatusModel($"Missing actual service bus configuration for {ex.Message}.")
                {
                    LoaderStatusType = LoaderStatusType.Error
                };
            }
            catch (InvalidServiceBusConnectionStringException ex)
            {
                _status = new LoaderStatusModel($"Invalid service bus connection string for {ex.Message}.")
                {
                    LoaderStatusType = LoaderStatusType.Error
                };
            }
            catch (InvalidConfigurationException ex)
            {
                _status = new LoaderStatusModel(ex.Message)
                {
                    LoaderStatusType = LoaderStatusType.Error
                };
            }
            catch (Exception ex)
            {
                _status = new LoaderStatusModel($"Unexpected error occurred: {ex.Message}")
                {
                    LoaderStatusType = LoaderStatusType.Error
                };
            }
            finally
            {
                SemaphoreSlim.Release();
            }

            return Status();
        }

        private async Task ConfigureAsync()
        {
            _status = new LoaderStatusModel("Loading Application Settings");
            var apiConfiguration = new AppConfiguration();
            try
            {
                _configuration.GetSection(AppConfiguration.OptionsName).Bind(apiConfiguration.Configurations);
            }
            catch (Exception ex)
            {
                throw new CouldNotBindConfigurationException(ex);
            }

            _status = new LoaderStatusModel("Validating Application Settings");
            apiConfiguration.Validate();
            await Task.Delay(1000);

            _status = new LoaderStatusModel("Registering Services");
            await Task.Delay(1000);

            foreach (var connection in apiConfiguration.Configurations)
            {
                _status = new LoaderStatusModel($"Registering Service: {connection.Name}");

                if (connection.BusConfiguration != default)
                {
                    ApiCollection.RegisterApi(
                        connection.Name,
                        new ServiceBusApi(connection.BusConfiguration));
                }

                if (connection.ApplicationInsightsConfiguration != default)
                {
                    ApiCollection.RegisterApi(
                        connection.Name,
                        new ApplicationInsightsApi(connection.ApplicationInsightsConfiguration));
                }

                await Task.Delay(1000);
            }

            _status = new LoaderStatusModel("Fetching queues, topics and subscriptions");
            foreach (var sbName in ApiCollection.GetServiceBusApiNames())
            {
                var sb = ApiCollection.GetServiceBusApi(sbName);

                try
                {
                    _status = new LoaderStatusModel($"Fetching queues from {sbName}");
                    await sb.ReloadQueuesAsync();
                    await Task.Delay(1000);

                    _status = new LoaderStatusModel($"Fetching topics from {sbName}");
                    await sb.ReloadTopicsAsync();
                    await Task.Delay(1000);
                }
                catch (UnauthorizedAccessException ex)
                {
                    throw new InvalidServiceBusConnectionStringException(sbName, ex);
                }
                catch (ArgumentException ex)
                {
                    throw new InvalidServiceBusConnectionStringException(sbName, ex);
                }
                catch
                {
                    _status = new LoaderStatusModel($"Retry-able error: Cannot read topics or queues from: {sbName}")
                    {
                        LoaderStatusType = LoaderStatusType.Warning
                    };
                    await Task.Delay(5000);
                }
            }

            _status = new LoaderStatusModel("Ready to go :-)")
            {
                RedirectUri = "/Monitor"
            };
        }
    }
}
