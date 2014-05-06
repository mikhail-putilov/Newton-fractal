$(document).ready(function () {
    var fills = ["FF0000", "00FF00", "0000FF", "FFFFFF"];
    var epsilon = 0.01;
    var minRe = -2;
    var maxRe = 2;
    var minIm = -2;
    var maxIm = 2;
    function reset() {
        minRe = -2;
        maxRe = 2;
        minIm = -2;
        maxIm = 2;
        $('#scale').text(2);
        main({"offsetX" : $('#mainCanvas').width()/2, "offsetY" : $('#mainCanvas').height()/2});
    }
    reset();
    
    function main(event) {
        var mainCanvas = document.getElementById("mainCanvas");
        var totalIterations = parseInt($('#totalIterations').val());

        function placePixel(ctx, x, y, hexColor) {
            ctx.fillStyle = hexColor;
            ctx.fillRect( x, y, 1, 1 );
        }

        function getFill(world_x1, world_y1) {
            function _getFill(rootNumber) {
                switch($('#colorScheme').val()) {
                    case 'Zebra': 
                        var color = 255*(i % 2);
                        var hex = (color).toString(16);
                        return hex + hex + hex; break;
                    case 'White': 
                        var color = totalIterations != 0 ? 255*Math.log(1+i)/Math.log(totalIterations) : 0;
                        var hex = (Math.ceil(color)).toString(16);
                        return hex + hex + hex;
                    case 'Hybrid': 
                        var color1 = Math.ceil(255 * Math.log(i + 1) / Math.log(totalIterations));
                        var color2 = Math.ceil(color1/4);
                        var color3 = Math.ceil(color1/2);
                        var hex1 = color1.toString(16);
                        var hex2 = color2.toString(16);
                        var hex3 = color3.toString(16);
                        switch(rootNumber) {
                            case 0: return hex1 + hex2 + "00";
                            case 1: return hex2  + hex1 + "00";
                            case 2: return "00" + hex3 + hex1;
                            default: return fills[rootNumber];
                        }
                    case 'Default': return fills[rootNumber];
                }
            }
            //init
            var world_x = world_x1;
            var world_y = world_y1;

            for (var i = 0; i < totalIterations; i++) {
                //precomputing values
                var sqWorld_x = world_x * world_x;
                var sqWorld_y = world_y * world_y;
                var sqWorldSum = sqWorld_x + sqWorld_y;
                var invsqSqWorldSum = /*world_x != 0|| world_y != 0 ? */1/(sqWorldSum * sqWorldSum)/* : 0*/;
                //use given formulas in presentation
                var next_world_x = 2/3 * world_x + (sqWorld_x - sqWorld_y)*invsqSqWorldSum/3;
                var next_world_y = 2/3 * world_y * (1 - world_x*invsqSqWorldSum);
                //converge?
                if (Math.abs(next_world_x - world_x) < epsilon &&
                    Math.abs(next_world_y - world_y) < epsilon )
                    return _getFill(next_world_x > 0 ? 0 : (next_world_y > 0 ? 1 : 2));
                world_x = next_world_x;
                world_y = next_world_y;
            }
            return _getFill(3);
        }

        function clearCanvas(context, canvas) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            var w = canvas.width;
            canvas.width = 1;
            canvas.width = w;
        }
        var scale = parseInt($('#scale').text());
        maxRe /= scale; maxIm /= scale; minIm /= scale; minRe /= scale;

        var scRe = (maxRe-minRe)/mainCanvas.height;
        var scIm = (maxIm-minIm)/mainCanvas.width;
        var x1 = scRe*(event.offsetX - mainCanvas.width/2);
        var y1 = scIm*(event.offsetY - mainCanvas.height/2);
        maxRe += x1; minRe += x1; maxIm += y1; minIm += y1; 
        
        var ctx = mainCanvas.getContext('2d');
        clearCanvas(ctx, mainCanvas);
        for (var x = 0; x < mainCanvas.width; x++) {
            for (var y = 0; y < mainCanvas.height; y++) {
                var world_x = minRe + x*scRe;
                var world_y = minIm + y*scIm;
                var color = getFill(world_x, world_y);
                placePixel(ctx, x, y, color);
            }
        }
        $('#scale').text(scale + 1);
    }
    $('#mainCanvas').click(main);
    $('#reset').click(reset);
});