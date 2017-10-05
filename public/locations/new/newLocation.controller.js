angular
  .module('floorplan')
  .controller('newLocationController', function ($scope, locationService, uploadService) {
    let floorplanUrl = '';
    $scope.addLocation = function () {
      uploadService
        .upload(uploadService.rename($scope.floorplan, $scope.id))
        .then((response) => {
          floorplanUrl = response.config.data.ngfName;
          console.log('floorplanurl', floorplanUrl);
          console.log('res ', response);
        })
        .then((response) => {
          locationService.addLocation({
            id: $scope.id,
            name: $scope.name,
            latitude: $scope.latitude,
            longitude: $scope.longitude,
            floorplan: floorplanUrl,
            district: $scope.district,
            active: $scope.active,
          });
        });
    };
  });