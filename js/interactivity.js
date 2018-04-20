function blockTouchMove (event){
    console.log(event);
    event.preventDefault();
    event.stopPropagation();
}