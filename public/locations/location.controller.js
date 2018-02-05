angular
  .module('floorplan')
  .controller('locationController', function (
    $scope,
    commentService,
    comments,
    location,
    $mdDialog,
    authorized,
    headerService,
    $state,
    replyService,
    $mdToast,
    $timeout,
    $document
  ) {
    $scope.S3PATH = 'https://s3.us-east-2.amazonaws.com/floorplans-uploads/';
    $scope.comments = comments;
    [$scope.location] = location;
    $scope.user = authorized;
    $scope.whichComments = { complete: false };
    $scope.highlighted = 1;

    // if ($scope.location.height >= $scope.location.width) {
    //   $scope.floorplanStyle = { height: '75vh' };
    // } else {
    //   $scope.floorplanStyle = { width: '95vw' };
    // }
    $mdToast
      .showSimple('Click on a marker to view details')
      .then(() => $mdToast.showSimple('Click anywhere on the floorplan to add a new comment.'));

    $scope.floorplanStyle =
      $scope.location.height >= $scope.location.width ? { height: '75vh' } : { width: '95vw' };
    // //console.log($scope.location);

    headerService.setTitle(`${$scope.location.name} (${$scope.location.id})`);
    const menuItems = [
      {
        userType: 'all',
        title: 'Show Archived Comments',
        action() {
          $scope.archiveFilter = false;
        }
      }
    ];

    headerService.setMenuItems(menuItems);

    const addComment = (comment, coordinates) => {
      const newComment = {
        image: comment.image,
        content: comment.content,
        tags: comment.tags,
        x: coordinates.x,
        y: coordinates.y,
        author: $scope.user.username,
        location: $scope.location.id
      };
      return commentService.addComment(newComment);
    };

    // EVENTUALLY backend logic will automatically call getComments and return it after the update db call.
    // Maybe.....
    $scope.deleteComment = function (id, index) {
      commentService.deleteComment(id).then(response => refreshComments());
    };
    function refreshComments() {
      return commentService.getComments($scope.location.id).then((response) => {
        // console.log(response);
        $scope.comments = response.data;
        return response;
      });
    }
    $scope.updateComment = (id, index) =>
      commentService.updateComment(id).then(response =>
        // console.log(index);
        refreshComments());

    $scope.addReply = (replyText, commentId) =>
      replyService.addReply(replyText, commentId).then(response => refreshComments());

    $scope.showModal = function (event) {
      const imgHeight = event.srcElement.clientHeight;
      const imgWidth = event.srcElement.clientWidth;
      const coordinates = {
        x: event.layerX / imgWidth * 100,
        y: event.layerY / imgHeight * 100
      };

      $mdDialog
        .show({
          templateUrl: './comments/comment.modal.template.html',
          controller: 'commentModalController',
          targetEvent: event,
          clickOutsideToClose: true,
          parent: angular.element(document.body),
          fullscreen: true,
          resolve: {
            tagTemplate(tagService) {
              return tagService.getTagTemplate();
            }
          }
        })
        .then((response) => {
          $scope.progress = 20;
          return addComment(response, coordinates);
        })
        .then((response) => {
          $scope.progress = 50;
          return commentService.getComments($scope.location.id).then((response) => {
            $scope.progress = 80;
            return refreshComments();
          });
        })
        .then((response) => {
          $scope.progress = 100;
          return response;
        })
        .then((response) => {
          $scope.progress = 0;
          $mdToast.show($mdToast.simple().textContent('Comment Added.'));
        });

      // This might not work in all browsers....but neither will flexbox sooooo
      // Confirmed it acts funny on iOS if you scroll past the initial view
      // //console.log(event.srcElement.clientHeight);
      // $scope.comments.push(newComment);
      // //console.log(event);
    };
    $scope.highlight = function (id) {
      $scope.highlighted = id;
      // $document.scrollToElement(`${id}`);
      $timeout(function () {
        $scope.highlighted = 0;
      }, 3000);
    };
  });
