/*
 * jQuery UI StarInput
 *
 * @version v1.0 (11/2014)
 *
 * Copyright 2014, William Pickard
 *
 *
 *
 * Authors:
 *   Will Pickard
 *
 *
 * Maintainer:
 *   Will Pickard
 *
 * Dependencies:
 *   jQuery v1.4+
 *   jQuery UI v1.8+
 *   font awesome icons
 */
(function($) {
    $.widget('ui.starinput', {
        options: {
            /** max value **/
            max: 5,

            /** min value **/
            min: 0,

            /** value of a full star **/
            value_full: 1,

            /** value of a half star **/
            value_half: 0.5,

            /** value of an empty star **/
            value_empty: 0,

            /** boolean for integeronly **/
            integerOnly: false,

            /** if you want to pass a specific image for the star then do it here **/
            imageSrc: null,

            /** fill color as css style **/
            fillColor: "#f1c40f",

            /** emptycolor as css style **/
            emptyColor: "#fff",

            /** series of star image classes **/
            star_full : "fa-star",

            star_empty: "fa-star-o",

            star_half: "fa-star-half-o",

            /** any additional icon class define here **/
            icon_class: "fa star",

            container_class: "star-box",
        },

        /**
         *called at beginning
         **/
        _create: function(){
            //handle static scoping
            var that = this;

            /*** array of star icons **/
            this.stars = []
            this.filledParts = 0;
            this.starBox = $("<div class=\"" + this.options.container_class + "\"></div>");
            //only allow single input tags
            if(this.element.is('input')){
                this.element.hide().after(this.starBox);
                /*** make the stars, init them to all open
                 *   and appendTo the starbox **/
                for(var i = 0; i < Math.ceil(this.options.max); i++){
                    this.stars.push($(this.makeStar(this.options.star_empty, i)).appendTo(this.starBox));
                }

                //calculate the parts of the star which will trigger hover events
                //if options.integerOnly is true then we will have the same amount of parts as we do stars
                //otherwise there will be 2x as many parts, one part per each half of a star
                this.parts = [];
                var numParts;
                if(this.options.integerOnly){
                    //in this case the hover effect will change this star to full
                    numParts = this.options.max;
                    for(var i = 0; i < numParts; i++){
                        var star = this.stars[i];
                        var offset = $(star).offset();
                        var part = [offset.left, offset.left + $(star).width()];
                        this.parts.push(star);

                        $(star).hover(function(){
                            $(this).removeClass(that.options.star_empty);
                            $(this).addClass(that.options.star_full);
                        });
                    }
                }
                else {
                    //in this case we will have to calculate the midpoint,
                    // and if the hover event falls to the left part then add the half class
                    // if it falls in the right part then add the full class
                    numParts = this.options.max * 2;
                    for(var i = 0; i < numParts; i += 2){
                        var star = this.stars[i / 2];
                        var offset = $(star).offset();
                        var width = $(star).width();
                        var center = offset.left + (width / 2);

                        var leftPart = [offset.left, center];
                        var rightPart = [center, (width) + offset.left];

                        this.parts.push(leftPart);
                        this.parts.push(rightPart);

                        $(star).hover(function(e){
                            var which = $(this).attr("data-which");
                            var star = that.stars[which];

                            $(star).mousemove(function(e){
                                that._placeHoverEventToPart(e, star);
                            });

                            that._placeHoverEventToPart(e, star);
                        }, function(e){
                            //remove the mousemove binding
                            $(star).remove("mousemove");
                        });
                    }//for
                }//else

                //add event listener to the box to update on mouseout
                $(this.starBox).hover(function(e){}, function(e){
                    that._updateValue();
                });
            }//if input
        },

        _placeHoverEventToPart: function(event, star){
            var coordinates = [event.screenX, event.screenY];
            var which = $(star).attr("data-which");
            var leftPart = this.parts[which * 2];
            var rightPart = this.parts[(which * 2) + 1];

            //measure the x value of the coordinate to place the hover event on a specific part
            //hover to far left
            if(coordinates[0] <= leftPart[0]){
                for(var i = which; i < this.stars.length; i++){
                    $(this.stars[i]).removeClass(this.options.star_full);
                    $(this.stars[i]).removeClass(this.options.star_half);
                    $(this.stars[i]).addClass(this.options.star_empty);
                }
            }
            //hover on left part
            if(coordinates[0] >= leftPart[0] && coordinates[0] <= leftPart[1]){
                for(var i = which; i < this.stars.length; i++){
                    $(this.stars[i]).removeClass(this.options.star_full);
                    $(this.stars[i]).removeClass(this.options.star_half);
                    $(this.stars[i]).addClass(this.options.star_empty);
                }
                $(star).removeClass(this.options.star_full);
                $(star).removeClass(this.options.star_empty);
                $(star).addClass(this.options.star_half);

                for(var i = 0; i < which; i++){
                    $(this.stars[i]).removeClass(this.options.star_empty);
                    $(this.stars[i]).removeClass(this.options.star_half);
                    $(this.stars[i]).addClass(this.options.star_full);
                }
            }
            //hover on far right (right part)
            else { //if(coordinates[0] >= leftPart[1] && coordinates[0] <= rightPart[1]){
                for(var i = which; i < this.stars.length; i++){
                    $(this.stars[i]).removeClass(this.options.star_full);
                    $(this.stars[i]).removeClass(this.options.star_half);
                    $(this.stars[i]).addClass(this.options.star_empty);
                }
                $(star).removeClass(this.options.star_empty);
                $(star).removeClass(this.options.star_half);
                $(star).addClass(this.options.star_full);

                for(var i = 0; i < which; i++){
                    $(this.stars[i]).removeClass(this.options.star_empty);
                    $(this.stars[i]).removeClass(this.options.star_half);
                    $(this.stars[i]).addClass(this.options.star_full);
                }
            }
        },

        /**
         * update the value of this input's count
         * @private
         */
        _updateValue: function(){
            var localValue = 0;
            for(var i = 0; i < this.stars.length; i++){
                var star = this.stars[i];
                if($(star).hasClass(this.options.star_empty)){
                    localValue += this.options.value_empty;
                }

                else if ($(star).hasClass(this.options.star_half)){
                    localValue += this.options.value_half;
                }

                else if ($(star).hasClass(this.options.star_full)){
                    localValue += this.options.value_full;
                }

                else {
                    //?wut
                }
            }//for

            this._setFilledParts(localValue);
        },

        /**
         * set the value of the filled parts and update the input element's value
         * @param value
         * @private
         */
        _setFilledParts: function(value){
            this.filledParts = value;
            this.element.val(value);
        },

        /***
         * make a star
         * @param which
         */
        makeStar: function(classString, which){
            return "<i data-which=" + which + " style=\"color: " + this.options.fillColor + "\" class=\"" + this.options.icon_class + " " + classString + "\"></i>";
        }
    });

})(jQuery);