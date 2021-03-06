/*
	Translucent - jQuery Banner Rotator / Slideshow
 	Copyright (c) 2011 Ramesh Kumar
	http://codecanyon.net/user/VF
	
	Version: 1.3.1 
	Created: 15 NOV 2011
	Updated: 22 FEB 2012
	
	Built using:
	jQuery				version: 1.7	http://jquery.com/
	jQuery Easing 		version: 1.3	http://gsgd.co.uk/sandbox/jquery/easing/
	Superfast Blur		version: 0.5	http://www.quasimondo.com/BoxBlurForCanvas
	getImageData 		version: 0.3	http://www.maxnov.com/getimagedata
		
*/

(function(b) {
    function a(d, e) {
        this.sett = b.extend({
            slide_autoplay: true,
            slide_delaytime: 5,
            slide_transition: 1,
            slide_transition_period: 800,
            slide_preload_images: 1,
            image_align_center: true,
            image_resize: true,
            image_resize_to_fit: false,
            button_size: 20,
            button_margin: 4,
            button_opacity: 0.7,
            button_space: 2,
            button_color: "#FFFFFF",
            button_show_next: true,
            button_show_back: false,
            button_show_timer: true,
            button_show_numbers: true,
            button_numbers_autohide: true,
            button_numbers_horizontal: false,
            caption_float_mode: false,
            caption_bg_blur: 12,
            caption_padding_x: 24,
            caption_padding_y: 12,
            caption_margin_x: 0,
            caption_margin_y: 0,
            caption_position_x: 50,
            caption_position_y: 100,
            caption_width: 300,
            caption_height: "",
            caption_bg_color: "#FFFFFF",
            caption_bg_opacity: 0.08,
            caption_bg_radius: 6,
            caption_bg_shadow: 0.3,
            caption_allow_selection: false,
            caption_border: 1,
            caption_border_color: "#FFFFFF",
            caption_border_opacity: 0.15,
            touch_dragdrop_factor: 60,
            touch_throw_factor: 5
        },
        e);
        this.$cont = d;
        this.bW = this.$cont.width();
        this.bH = this.$cont.height();
        this.slides = [];
        this.slide_tot = this.$cont.children(".Slide").length;
        this.slide_dir = -1;
        this.slide_sel = 0;
        this.slide_pr1 = "";
        this.slide_pr2 = "";
        this.slide_fin = false;
        this.slide_drg = false;
        this.slide_sta = true;
        this.clockDraw;
        this.clockContext;
        this.clockStart;
        this.clockDiff = 0;
        this.clockTimer = this.sett.button_show_timer;
        this.clockPlaying = false;
        this.buttonNext = this.sett.button_show_next;
        this.buttonBack = this.sett.button_show_back;
        this.buttonNumber = this.sett.button_show_numbers;
        this.FF2 = b.browser.mozilla && parseFloat(b.browser.version, 10) < 1.9 ? true: false;
        this.IE8 = b.browser.msie && parseInt(b.browser.version, 10) <= 8 ? true: false;
        this.canvasSupport = document.createElement("canvas").getContext;
        this.buttonIE = this.IE8 ? 1 : 0;
        this.buttonLeaveTimer;
        this.draggable = true;
        this.dragged = false;
        this.numShow = false;
        this.autoPlaying = this.sett.slide_autoplay;
        this.timerob = b('<div style="position:absolute;"></div>').appendTo(this.$cont);
        var g = this.sett.slide_transition;
        if (g <= 1 || isNaN(g)) {
            this.sett.slide_transition = "move"
        } else {
            if (g == 2) {
                this.sett.slide_transition = "fade"
            } else {
                if (g == 3) {
                    this.sett.slide_transition = "slideIn"
                } else {
                    if (g >= 4) {
                        this.sett.slide_transition = "slideOut"
                    }
                }
            }
        }
        if (this.sett.caption_margin_y == 0 && !this.sett.caption_float_mode) {
            this.sett.caption_bg_radius = 0
        }
        if (this.sett.button_show_numbers && !this.sett.button_show_next) {
            this.sett.button_numbers_autohide = false
        }
        if (b.browser.webkit) {
            this.shProp = "-webkit-box-shadow"
        } else {
            if (b.browser.mozilla && this.$cont.css("box-shadow") != "none") {
                this.shProp = "-moz-box-shadow"
            } else {
                this.shProp = "box-shadow"
            }
        }
        if (this.sett.slide_preload_images > this.slide_tot) {
            this.sett.slide_preload_images = this.slide_tot
        }
        var k = /url\(["']?([^'")]+)['"]?\)/;
        var c = b('<div class="icon"></div>').appendTo(this.$cont);
        var h = b('<div class="timer_sprite"></div>').appendTo(this.$cont);
        this.timer_sprite = h.css("background-image").replace(k, "$1");
        var j = [c.css("background-image").replace(k, "$1")];
        if (this.sett.slide_preload_images > 1) {
            for (var f = 0; f < this.slide_tot; f++) {
                j[f + 1] = this.$cont.children(".Slide").eq(f).find("img").attr("src")
            }
        } else {
            j[1] = this.$cont.children(".Slide").eq(0).find("img").attr("src")
        }
        this.regxHost = new RegExp("^(?:f|ht)tp(?:s)?://([^/]+)", "im");
        this.preload(j);
        c.remove();
        h.remove()
    }
    a.prototype = {
        preload: function(d) {
            var c = this;
            for (var f = 0; f < d.length; f++) {
                d[f] = {
                    src: d[f],
                    loaded: false
                };
                var e = new Image();
                b(e).bind("load", {
                    id: f
                },
                function(j) {
                    d[j.data.id].loaded = true;
                    var g = true;
                    for (var h = 0; h < d.length; h++) {
                        if (!d[h].loaded) {
                            g = false
                        }
                    }
                    if (g) {
                        c.init()
                    }
                });
                e.src = d[f].src
            }
        },
        init: function() {
            var r = this;
            var h = Math.max((this.sett.caption_bg_blur / 3), 3);
            var s = (this.sett.button_show_next ? this.sett.button_size + this.sett.button_space: 0) + (this.sett.button_show_back ? this.sett.button_size + this.sett.button_space: 0) + (this.sett.button_show_timer ? this.sett.button_size + this.sett.button_space: 0) + (!this.sett.button_numbers_autohide && this.sett.button_numbers_horizontal ? (this.sett.button_size + this.sett.button_space) * this.slide_tot: 0);
            var v, t, w, D;
            var j = this.$cont.children(".Slide");
            for (var z = 0; z < this.slide_tot; z++) {
                var q = j.eq(z).css({
                    position: "absolute",
                    "z-index": this.slide_tot - z,
                    left: "0px",
                    top: "0px",
                    width: this.bW + "px",
                    height: this.bH + "px",
                    overflow: "hidden",
                    visibility: "visible"
                });
                var C = q.find("img").css({
                    filter: "progid:DXImageTransform.Microsoft.Alpha(opacity=100)",
                    "z-index": 1,
                    position: "absolute",
                    left: "0px",
                    top: "0px",
                    border: "0px"
                }).attr("galleryimg", "no").addClass("noSelect");
                var A = b("<span></span>").css("opacity", 0.99);
                var p = q.find("div").wrapInner(A);
                if (this.sett.caption_allow_selection) {
                    p.bind("mousedown",
                    function(i) {
                        i.stopImmediatePropagation()
                    })
                } else {
                    p.addClass("noSelect").attr("unselectable", "on")
                }
                if (p.length > 0) {
                    p.css({
                        "z-index": 4,
                        position: "absolute",
                        left: this.sett.caption_padding_x + "px",
                        top: this.sett.caption_padding_y + "px"
                    });
                    var m = b("<div></div>").css({
                        "z-index": 3,
                        position: "absolute"
                    }).appendTo(q);
                    var f = b("<div></div>").css({
                        "z-index": 4,
                        position: "absolute",
                        overflow: "hidden",
                        left: "0px",
                        top: "0px"
                    }).appendTo(m);
                    if (this.sett.caption_float_mode) {
                        var B = q.data("position");
                        if (B) {
                            v = parseInt(B.split(",")[0], 10);
                            t = parseInt(B.split(",")[1], 10)
                        } else {
                            v = this.sett.caption_position_x;
                            t = this.sett.caption_position_y
                        }
                        var l = q.data("width");
                        if (l) {
                            w = parseInt(l, 10)
                        } else {
                            w = this.sett.caption_width
                        }
                        if (v + w + this.sett.caption_margin_x > this.bW) {
                            w = this.bW - v - this.sett.caption_margin_x
                        }
                        p.css({
                            width: (w - (this.sett.caption_padding_x * 2)) + "px"
                        });
                        var g = q.data("height");
                        if (g) {
                            D = parseInt(g, 10)
                        } else {
                            D = this.sett.caption_height == "" ? p.height() + (this.sett.caption_padding_y * 2) : this.sett.caption_height
                        }
                        p.css({
                            height: this.sett.caption_height == "" ? "auto": D + "px"
                        });
                        m.css({
                            left: v + "px",
                            top: t + "px",
                            width: w,
                            height: D
                        })
                    } else {
                        m.css({
                            left: this.sett.caption_padding_x + "px",
                            width: (this.bW - ((this.sett.caption_padding_x + this.sett.caption_margin_x) * 2) - s) + "px"
                        });
                        p.css({
                            width: (this.bW - ((this.sett.caption_padding_x + this.sett.caption_margin_x) * 2) - s) + "px"
                        })
                    }
                    var d;
                    var o = p.height() + (this.sett.caption_padding_y * 2);
                    if (!this.sett.caption_float_mode) {
                        v = this.sett.caption_margin_x;
                        t = this.bH - o - this.sett.caption_margin_y;
                        w = this.bW - (this.sett.caption_margin_x * 2);
                        D = o;
                        p.css({
                            width: (w - s - (this.sett.caption_padding_x * 2)) + "px"
                        });
                        m.css({
                            left: v + "px",
                            top: t + "px",
                            width: w + "px",
                            height: D
                        })
                    }
                    f.css({
                        width: w,
                        height: D
                    });
                    p.appendTo(f);
                    var e = q.data("caption_bg_shadow") ? q.data("caption_bg_shadow") : this.sett.caption_bg_shadow;
                    if (this.sett.caption_bg_blur > 0) {
                        if (this.IE8) {
                            d = b('<div style="position:absolute; z-index:1; overflow:hidden; width:' + (w - 1) + "px; height:" + (D - 1) + 'px; top:0px; left:0px"><div style="position:absolute; z-index:2; width:' + (w + (this.sett.caption_bg_blur * 2)) + "px; height:" + (D + (this.sett.caption_bg_blur * 2)) + "px; top:" + ( - (this.sett.caption_bg_blur) * 2) + "px; left:" + ( - (this.sett.caption_bg_blur * 2)) + "px; -ms-filter: progid:DXImageTransform.Microsoft.blur(pixelradius=" + this.sett.caption_bg_blur + "); filter: progid:DXImageTransform.Microsoft.blur(pixelradius=" + this.sett.caption_bg_blur + ');"><img src="' + C.attr("src") + '" style="position:absolute; left:' + ( - v + (this.sett.caption_bg_blur)) + "px; top:" + ( - t + (this.sett.caption_bg_blur)) + 'px;" /></div></div>').appendTo(m);
                            if (this.sett.caption_margin_y <= this.sett.caption_bg_blur / 2 && !this.sett.caption_float_mode) {
                                d.append('<div style="position:absolute; z-index:1; width:' + (w + (h * 2)) + "px; height:" + (D + (h * 2)) + "px; top:" + ( - (h) * 2) + "px; left:" + ( - (h * 2)) + "px; -ms-filter: progid:DXImageTransform.Microsoft.blur(pixelradius=" + h + "); filter: progid:DXImageTransform.Microsoft.blur(pixelradius=" + h + ');"><img src="' + C.attr("src") + '" style="position:absolute; left:' + ( - v + (h)) + "px; top:" + ( - t + (h)) + 'px;" /></div>')
                            }
                        } else {
                            if (!this.FF2) {
                                d = b('<canvas id="c' + (z + 1) + '" width="' + w + 'px" height="' + D + 'px" style="position:absolute; z-index:1; top: 0px; left: 0px;  -moz-border-radius: ' + this.sett.caption_bg_radius + "px; -webkit-border-radius: " + this.sett.caption_bg_radius + "px; border-radius: " + this.sett.caption_bg_radius + "px; -khtml-border-radius: " + this.sett.caption_bg_radius + 'px;"></canvas>').appendTo(m)
                            }
                        }
                    } else {
                        if (e > 0 && !this.FF2) {
                            d = b('<div id="c' + (z + 1) + '" width="' + w + 'px" height="' + D + 'px" style="position:absolute; z-index:1; top: 0px; left: 0px;  -moz-border-radius: ' + this.sett.caption_bg_radius + "px; -webkit-border-radius: " + this.sett.caption_bg_radius + "px; border-radius: " + this.sett.caption_bg_radius + "px; -khtml-border-radius: " + this.sett.caption_bg_radius + 'px;"></div>').appendTo(m)
                        }
                    }
                    var n = q.data("caption_bg_color") ? q.data("caption_bg_color") : this.sett.caption_bg_color;
                    var u = q.data("caption_bg_opacity") ? q.data("caption_bg_opacity") : this.sett.caption_bg_opacity;
                    var y = b('<div style="position:absolute; z-index:2; left:0px; top:0px; width:' + w + "px; height:" + D + "px; background-color:" + n + ";  -moz-border-radius: " + this.sett.caption_bg_radius + "px; -webkit-border-radius: " + this.sett.caption_bg_radius + "px; border-radius: " + this.sett.caption_bg_radius + "px; -khtml-border-radius: " + this.sett.caption_bg_radius + 'px;"></div>').appendTo(m).css("opacity", u);
                    if (this.sett.caption_border) {
                        var x = b('<div style="position:absolute; z-index:3; left:0px; top:0px; width:' + (w - (this.sett.caption_border * 2)) + "px; height:" + (D - (this.sett.caption_border * 2)) + "px; border:" + this.sett.caption_border + "px solid " + this.sett.caption_border_color + ";  -moz-border-radius: " + this.sett.caption_bg_radius + "px; -webkit-border-radius: " + this.sett.caption_bg_radius + "px; border-radius: " + this.sett.caption_bg_radius + "px; -khtml-border-radius: " + this.sett.caption_bg_radius + 'px;"></div>').appendTo(m).css("opacity", this.sett.caption_border_opacity)
                    }
                    if (e > 0 && !this.FF2) {
                        if (b.browser.webkit) {
                            if (parseInt(b.browser.version, 10) < 533) {
                                d.css(this.shProp, "0px 0px 6px rgba(0, 0, 0, " + e + ")")
                            } else {
                                d.css(this.shProp, "0px 0px 6px 0px rgba(0, 0, 0, " + e + ")")
                            }
                        } else {
                            if (b.browser.mozilla) {
                                if (d.css("box-shadow") != "none") {
                                    d.css(this.shProp, "0px 0px 4px 1px rgba(0, 0, 0, " + e + ")")
                                } else {
                                    d.css(this.shProp, "0px 0px 4px 0px rgba(0, 0, 0, " + e + ")")
                                }
                            } else {
                                if (b.browser.opera) {
                                    d.css(this.shProp, "0px 0px 4px 1px rgba(0, 0, 0, " + e + ")")
                                } else {
                                    d.css(this.shProp, "0px 0px 6px 0px rgba(0, 0, 0, " + e + ")")
                                }
                            }
                        }
                    }
                    m.hide();
                    p.hide()
                }
                this.slides.push({
                    src: C.attr("src"),
                    scale: 1,
                    ox: "",
                    oy: "",
                    con: q,
                    img: C,
                    txt: p.length > 0 ? p: false,
                    cap: m,
                    loaded: false,
                    butt: "",
                    z: this.slide_tot - z,
                    can: d,
                    cx: v,
                    cy: t,
                    cw: w,
                    ch: D,
                    tx: this.sett.caption_padding_x + v,
                    ty: this.sett.caption_padding_y + t,
                    tw: p.width(),
                    delay: (q.data("delay") ? q.data("delay") : this.sett.slide_delaytime) * 1000
                });
                q.hide().bind("mousedown touchstart", {
                    id: z
                },
                function(i) {
                    if (r.draggable && !r.slide_drg) {
                        if (i.type == "mousedown") {
                            if (r.slide_fin) {
                                r.startDrag(i.data.id, i.pageX)
                            }
                        } else {
                            if (r.slide_fin && i.originalEvent.touches.length > 0 && i.originalEvent.touches.length < 2) {
                                r.startDrag(i.data.id, i.originalEvent.changedTouches[0].pageX)
                            }
                        }
                    }
                    if (i.type == "mousedown") {
                        i.preventDefault()
                    }
                })
            }
            r.imageLoad(0);
            for (var z = 1; z < this.slide_tot; z++) {
                var c = new Image();
                r.slides[z].img.hide();
                b(c).bind("load", {
                    id: z
                },
                function(i) {
                    r.imageLoad(i.data.id)
                });
                c.src = this.slides[z].src
            }
            if (this.draggable) {
                var k = this.$cont.find("a");
                k.each(function() {
                    var i = b(this);
                    i.bind("click", {
                        l: i.attr("href"),
                        t: i.attr("target")
                    },
                    function(G) {
                        G.stopImmediatePropagation();
                        G.preventDefault();
                        var E = G.data.l;
                        var F = G.data.t ? G.data.t.toLowerCase() : "_self";
                        if (!r.slide_drg) {
                            b(document).unbind("mouseup.drag touchend.drag");
                            b(document).unbind("mousemove.drag touchmove.drag");
                            if (F == "_self") {
                                window.location.href = E
                            } else {
                                if (F == "_blank") {
                                    window.open(E)
                                } else {
                                    if (F == "_top") {
                                        top.location.href = E
                                    } else {
                                        parent.location.href = E
                                    }
                                }
                            }
                        } else {
                            r.slide_drg = false
                        }
                        return false
                    });
                    if (i.find("img").length < 1) {
                        i.bind("mousedown",
                        function(E) {
                            E.preventDefault();
                            return false
                        })
                    }
                })
            }
        },
        imageLoad: function(d) {
            var c = this;
            if (this.sett.image_resize) {
                if (this.slides[d].img[0].width !== this.bW || this.slides[d].img[0].height !== this.bH) {
                    this.slides[d].scale = this.bW / this.slides[d].img[0].width;
                    if ((this.slides[d].scale * this.slides[d].img[0].height < this.bH && !this.sett.image_resize_to_fit) || (this.slides[d].scale * this.slides[d].img[0].height > this.bH && this.sett.image_resize_to_fit)) {
                        this.slides[d].scale = this.bH / this.slides[d].img[0].height;
                        this.slides[d].img.height(this.bH);
                        this.slides[d].img.width(this.slides[d].img[0].width * this.slides[d].scale);
                        if (this.sett.image_align_center) {
                            this.slides[d].ox = (this.bW - (this.slides[d].img[0].width * this.slides[d].scale)) / 2;
                            this.slides[d].img.css({
                                left: this.slides[d].ox
                            })
                        }
                        if (this.IE8) {
                            b(this.slides[d].can).find("img").each(function() {
                                b(this).attr({
                                    width: c.slides[d].img[0].width * c.slides[d].scale,
                                    height: c.bH
                                });
                                if (c.sett.image_align_center) {
                                    b(this).css({
                                        left: parseInt(b(this).css("left"), 10) + c.slides[d].ox
                                    })
                                }
                            })
                        }
                    } else {
                        this.slides[d].img.width(this.bW);
                        this.slides[d].img.height(this.slides[d].img[0].height * this.slides[d].scale);
                        if (this.sett.image_align_center) {
                            this.slides[d].oy = (this.bH - (this.slides[d].img[0].height * this.slides[d].scale)) / 2;
                            this.slides[d].img.css({
                                top: this.slides[d].oy
                            })
                        }
                        if (this.IE8) {
                            b(this.slides[d].can).find("img").each(function() {
                                b(this).attr({
                                    width: c.bW,
                                    height: c.slides[d].img[0].height * c.slides[d].scale
                                });
                                if (c.sett.image_align_center) {
                                    b(this).css({
                                        top: parseInt(b(this).css("top"), 10) + c.slides[d].oy
                                    })
                                }
                            })
                        }
                    }
                }
            } else {
                if (this.sett.image_align_center) {
                    if (this.slides[d].img[0].width !== this.bW) {
                        this.slides[d].ox = (this.bW - this.slides[d].img[0].width) / 2;
                        this.slides[d].img.css({
                            left: this.slides[d].ox
                        })
                    }
                    if (this.slides[d].img[0].height !== this.bH) {
                        this.slides[d].oy = (this.bH - this.slides[d].img[0].height) / 2;
                        this.slides[d].img.css({
                            top: this.slides[d].oy
                        })
                    }
                }
            }
            if (!this.IE8 && !this.FF2 && this.sett.caption_bg_blur > 0 && this.slides[d].txt) {
                this.createBlur(d)
            } else {
                this.showSlide(d)
            }
        },
        getHostName: function(c) {
            var d = c.match(this.regxHost);
            if (d !== null) {
                return d[1].toString()
            } else {
                return false
            }
        },
        createBlur: function(e) {
            var c = this;
            var d = this.getHostName(c.slides[e].src);
            if (d && d !== document.domain) {
                b.getImageData({
                    url: c.slides[e].src,
                    success: function(f) {
                        boxBlurImage(f, c.slides[e].cx, c.slides[e].cy, c.slides[e].cw, c.slides[e].ch, c.slides[e].scale, c.slides[e].ox, c.slides[e].oy, c.slides[e].can[0], c.sett.caption_bg_blur, false, 2);
                        c.showSlide(e)
                    },
                    error: function(g, f) {
                        c.showSlide(e)
                    }
                })
            } else {
                boxBlurImage(c.slides[e].img[0], c.slides[e].cx, c.slides[e].cy, c.slides[e].cw, c.slides[e].ch, c.slides[e].scale, c.slides[e].ox, c.slides[e].oy, c.slides[e].can[0], c.sett.caption_bg_blur, false, 2);
                c.showSlide(e)
            }
        },
        showSlide: function(c) {
            this.slides[c].con.css({
                "background-image": "none"
            });
            this.slides[c].loaded = true;
            if (c == this.slide_sel) {
                this.slides[c].img.fadeIn(400)
            } else {
                this.slides[c].img.show()
            }
            if (c == 0) {
                this[this.sett.slide_transition]();
                this.setNavigation()
            }
        },
        setNavigation: function() {
            var d = this;
            var e = this.navigation().appendTo(this.$cont);
            var c = e.position().left;
            if (!this.IE8) {
                e.hide().fadeIn(700)
            }
            e.css({
                left: c - 30
            }).animate({
                left: c
            },
            {
                duration: 700,
                easing: "easeInOutQuart",
                queue: false,
                complete: function() {
                    if (!d.sett.button_numbers_autohide && d.sett.button_show_numbers) {
                        for (var f = 0; f < d.slide_tot; f++) {
                            d.showHideButton(f, true)
                        }
                    }
                }
            });
            b(".col").css("background-color", this.sett.button_color)
        },
        startDrag: function(j, i) {
            var c = this;
            var h;
            var g;
            var e = 0;
            var d = 0;
            var f = false;
            if (this.sett.slide_transition !== "move") {
                this.slides[j].con.css(this.shProp, "0px 0px 45px 0px #000000")
            }
            this.slide_drg = false;
            b(document).unbind("mousemove.drag touchmove.drag").bind("mousemove.drag touchmove.drag",
            function(l) {
                var k;
                if (l.type == "mousemove") {
                    k = l.pageX
                } else {
                    if (l.originalEvent.touches.length > 1) {
                        return false
                    } else {
                        k = l.originalEvent.changedTouches[0].pageX
                    }
                }
                g = k - i;
                if (g > c.bW) {
                    g = c.bW
                }
                if (g < -c.bW) {
                    g = -c.bW
                }
                d = k - e;
                e = k;
                c.slides[j].con.css("left", g);
                if (g > 0) {
                    h = c.slide_sel - 1 < 0 ? c.slide_tot - 1 : c.slide_sel - 1;
                    if (!c.slide_drg) {
                        c.slides[h].con.show()
                    }
                    if (c.slides[h].txt) {
                        c.slides[h].cap.hide()
                    }
                    c.slide_drg = true
                } else {
                    if (g < 0) {
                        h = c.slide_sel + 1 > c.slide_tot - 1 ? 0 : c.slide_sel + 1;
                        if (!c.slide_drg) {
                            c.slides[h].con.show()
                        }
                        if (c.slides[h].txt) {
                            c.slides[h].cap.hide()
                        }
                        c.slide_drg = true
                    }
                }
                if (g !== 0) {
                    c.slide_pr1 = h;
                    c.zSort(2, 1);
                    if (c.clockPlaying) {
                        c.clockPlaying = false;
                        c.timerob.stop();
                        c.timerReset(true)
                    }
                    if (c.sett.slide_transition == "move") {
                        c.slides[h].con.css({
                            left: g + (g > 0 ? -c.bW: c.bW)
                        })
                    } else {
                        c.slides[h].con.css({
                            left: "0px"
                        })
                    }
                }
                l.preventDefault();
                return false
            });
            b(document).unbind("mouseup.drag touchend.drag").bind("mouseup.drag touchend.drag",
            function(m) {
                b(document).unbind("mousemove.drag touchmove.drag");
                b(document).unbind("mouseup.drag touchend.drag");
                if (c.slide_drg) {
                    var k = 0;
                    var l = c.slides[j].con.position().left;
                    if (c.IE8) {
                        if (l > c.sett.touch_dragdrop_factor) {
                            k = 1
                        } else {
                            if (l < -c.sett.touch_dragdrop_factor) {
                                k = -1
                            }
                        }
                    } else {
                        if (l > c.sett.touch_dragdrop_factor) {
                            k = 1
                        } else {
                            if (l < -c.sett.touch_dragdrop_factor) {
                                k = -1
                            }
                        }
                        if (d > c.sett.touch_throw_factor) {
                            k = l < 0 ? 0 : 1
                        } else {
                            if (d < -c.sett.touch_throw_factor) {
                                k = l > 0 ? 0 : -1
                            }
                        }
                    }
                    if (k != 0) {
                        c.dragged = true;
                        c.slide_dir = k;
                        c.slide_fin = false;
                        if (c.sett.slide_transition == "move") {
                            c.slides[j].con.stop().animate({
                                left: c.bW * k
                            },
                            {
                                duration: Math.max((c.bW - (c.slides[j].con.position().left * k)) / 1.5, 400),
                                step: function(n, o) {
                                    c.slides[h].con.css({
                                        left: n + (g > 0 ? -c.bW: c.bW)
                                    })
                                },
                                complete: function() {
                                    c.slide_fin = true;
                                    c.slide_drg = false;
                                    if (c.sett.button_show_numbers) {
                                        c.toggleButton()
                                    } else {
                                        c.timerReset(true)
                                    }
                                    if (c.slides[h].txt) {
                                        c.slides[h].cap.hide();
                                        if (c.sett.caption_float_mode) {
                                            c.slides[h].cap.css("left", (c.IE8 ? c.slides[h].cx: c.slides[h].cx + (100 * -c.slide_dir)) + "px")
                                        }
                                    }
                                    if (c.slides[h].txt) {
                                        c.animateCaption()
                                    }
                                    if (c.autoPlaying) {
                                        c.startDelayTimer()
                                    }
                                }
                            })
                        } else {
                            if (c.IE8) {
                                if (c.slides[c.slide_pr1].txt) {
                                    c.slides[c.slide_pr1].txt.stop().clearQueue();
                                    c.slides[c.slide_pr1].cap.stop().clearQueue()
                                }
                            }
                            c.slides[j].con.stop().animate({
                                left: (c.bW + 30) * k
                            },
                            {
                                duration: Math.max((c.bW - (c.slides[j].con.position().left * k)) / 0.75, 600),
                                easing: "easeOutQuart",
                                complete: function() {
                                    c.slides[j].con.css(c.shProp, "none");
                                    c.slide_fin = true;
                                    c.slide_drg = false;
                                    if (c.sett.button_show_numbers) {
                                        c.toggleButton()
                                    } else {
                                        c.timerReset(true)
                                    }
                                    if (c.slides[h].txt) {
                                        c.slides[h].cap.hide();
                                        if (c.sett.caption_float_mode) {
                                            c.slides[h].cap.css("left", (c.IE8 ? c.slides[h].cx: c.slides[h].cx + (100 * -c.slide_dir)) + "px")
                                        }
                                    }
                                    if (c.slides[h].txt) {
                                        c.animateCaption()
                                    }
                                    if (c.autoPlaying) {
                                        c.startDelayTimer()
                                    }
                                }
                            })
                        }
                        c.slide_sel = h
                    } else {
                        if (c.sett.slide_transition == "move") {
                            c.slides[j].con.stop().animate({
                                left: 0
                            },
                            {
                                step: function(n, o) {
                                    c.slides[h].con.css({
                                        left: n + (g > 0 ? -c.bW: c.bW)
                                    })
                                },
                                complete: function() {
                                    c.slide_drg = false;
                                    if (c.autoPlaying) {
                                        c.startDelayTimer()
                                    }
                                }
                            })
                        } else {
                            c.slides[j].con.stop().animate({
                                left: 0
                            },
                            {
                                complete: function() {
                                    c.slide_drg = false;
                                    c.slides[j].con.css(c.shProp, "none");
                                    if (c.autoPlaying) {
                                        c.startDelayTimer()
                                    }
                                }
                            })
                        }
                    }
                }
                return false
            })
        },
        changeSlide: function(c) {
            this.slide_pr2 = this.slide_pr1;
            this.slide_pr1 = this.slide_sel;
            this.dragged = false;
            if (c == "next") {
                this.slide_sel = this.slide_sel + 1 > this.slide_tot - 1 ? 0 : this.slide_sel + 1
            } else {
                if (c == "back") {
                    this.slide_sel = this.slide_sel - 1 < 0 ? this.slide_tot - 1 : this.slide_sel - 1
                } else {
                    this.slide_sel = c
                }
            }
            this[this.sett.slide_transition]()
        },
        zSort: function(e, d) {
            var f = 1;
            for (var c = 0; c < this.slide_tot; c++) {
                if (c !== this.slide_sel && c !== this.slide_pr1) {
                    if (this.slides[c]) {
                        this.slides[c].con.css("z-index", f);
                        if (this.IE8) {
                            this.slides[c].con.hide()
                        }
                    }
                    f++
                }
            }
            if (this.slides[this.slide_pr1]) {
                this.slides[this.slide_pr1].con.css("z-index", this.slide_tot + d)
            }
            if (this.slides[this.slide_sel]) {
                this.slides[this.slide_sel].con.css("z-index", this.slide_tot + e)
            }
        },
        textOut: function() {
            var c = this;
            if (this.slides[this.slide_pr1] && this.sett.slide_transition == "fade") {
                this.slides[this.slide_pr1].txt.stop().clearQueue().animate({
                    left: ( - c.slides[c.slide_pr1].cw / 2) + "px"
                },
                {
                    duration: 150,
                    easing: "easeOutQuad",
                    queue: false,
                    complete: function() {
                        b(this).hide()
                    }
                })
            }
        },
        textIn: function() {
            var c = this;
            var d = -this.slide_dir;
            if (this.sett.slide_transition == "fade" && !this.dragged) {
                d = 1
            }
            if (this.slides[this.slide_sel].txt) {
                if (this.IE8) {
                    this.slides[this.slide_sel].txt.css({
                        left: (this.sett.caption_padding_x + (100 * d)) + "px",
                        filter: "none"
                    })
                } else {
                    this.slides[this.slide_sel].txt.css({
                        left: (this.sett.caption_padding_x + (100 * d)) + "px",
                        opacity: 1
                    })
                }
                this.slides[this.slide_sel].txt.hide().fadeIn(600,
                function() {
                    if (c.IE8) {
                        b(this).removeAttr("filter").removeAttr("-ms-filter")
                    }
                }).animate({
                    left: this.sett.caption_padding_x + "px"
                },
                {
                    duration: 800,
                    easing: "easeOutQuart",
                    queue: false
                })
            }
        },
        animateCaption: function() {
            var c = this;
            var d = this.slide_sel;
            this.slides[this.slide_sel].txt.hide();
            if (this.sett.caption_float_mode) {
                if (this.IE8) {
                    this.slides[d].cap.hide().fadeIn({
                        duration: 300
                    })
                } else {
                    this.slides[d].cap.hide().fadeIn({
                        duration: 800,
                        queue: false
                    }).animate({
                        left: this.slides[d].cx
                    },
                    {
                        duration: 600
                    })
                }
                this.textIn()
            } else {
                if (this.IE8) {
                    this.slides[d].cap.hide().fadeIn({
                        duration: 600,
                        complete: function() {
                            c.textIn()
                        },
                        queue: false
                    })
                } else {
                    this.slides[d].cap.hide().fadeIn({
                        duration: 600,
                        queue: false
                    });
                    this.slides[d].cap.animate({
                        _: 100
                    },
                    {
                        duration: 400,
                        complete: function() {
                            c.textIn()
                        }
                    })
                }
            }
        },
        createButton: function(c, l, p, k, i) {
            var q = this;
            var m = this.sett.button_size;
            var h = b("<div></div>", {
                style: "z-index:" + p + "; position: absolute; width:" + (m + (this.buttonIE * 2)) + "px; height:" + (m + (this.buttonIE * 2)) + "px; cursor: pointer; "
            }).addClass("noSelect");
            var f = b("<div></div>", {
                style: "z-index:2; position: absolute; left: " + this.buttonIE + "px; top: " + this.buttonIE + "px; right:" + this.buttonIE + "px; bottom:" + this.buttonIE + "px; width:" + m + "px; height:" + m + "px;"
            }).appendTo(h);
            if (this.IE8) {
                var g = b("<div></div>", {
                    style: "z-index:1; position: absolute; background-color:#000000; left: 0px; top: 0px; width:100%; height:100%; filter: alpha(opacity=10)"
                }).appendTo(h);
                var d = '<div class="col" style="z-index:2; position:absolute; left:0px; top:0px; width:100%; height:100%; filter: alpha(opacity=35);"></div>';
                var e = '<div class="col" style="z-index:3; position:absolute; left:1px; right:1px; top:0px; height:100%; filter: alpha(opacity=100);"></div>';
                var n = '<div class="col" id="iconHolder" unselectable="on" style="z-index:4; position:absolute; left:0px; top: 1px; width: 100%; height: ' + (m - 2) + 'px; filter: alpha(opacity=100);" align="center"></div>';
                b(d + e + n).appendTo(f);
                var o = f.find("#iconHolder");
                if (k) {
                    o.addClass("icon").css({
                        "background-position": (i == "next" ? ((m - 30) / 2) - 30 : i == "pause" ? ((m - 30) / 2) - (this.autoPlaying ? 60 : 90) : (m - 30) / 2) + "px center",
                        "background-repeat": "no-repeat"
                    })
                } else {
                    var j = b('<span unselectable="on" class="buttonText" style="position:relative; text-align: center; line-height:' + (m - 1) + "px; left:" + (String(i + 1).length <= 1 ? 1 : 0) + 'px; top:-1px;"  align="center">' + (i + 1) + "</span>");
                    o.append(j)
                }
            } else {
                if (b.browser.webkit) {
                    if (parseInt(b.browser.version, 10) < 533) {
                        f.css(this.shProp, "0px 0px 2px #000000")
                    } else {
                        f.css(this.shProp, "0px 0px 5px -1px #000000")
                    }
                } else {
                    if (b.browser.mozilla) {
                        if (f.css("box-shadow") != "none") {
                            f.css(this.shProp, "0px 0px 3px -1px #000000")
                        } else {
                            f.css(this.shProp, "0px 0px 2px -1px #000000")
                        }
                    } else {
                        if (b.browser.opera) {
                            f.css(this.shProp, "0px 0px 2px 0px #000000")
                        } else {
                            f.css(this.shProp, "0px 0px 5px -1px #000000")
                        }
                    }
                }
                f.css({
                    "-moz-border-radius": "2px",
                    "-webkit-border-radius": "2px",
                    "border-radius": "2px",
                    "-khtml-border-radius": "2px"
                }).addClass("col");
                if (k) {
                    f.addClass("icon").css({
                        "background-position": (i == "next" ? ((m - 30) / 2) - 30 : i == "pause" ? ((m - 30) / 2) - (this.autoPlaying ? 60 : 90) : (m - 30) / 2) + "px center",
                        "background-repeat": "no-repeat"
                    })
                } else {
                    h.append(b('<div align="center" class="buttonText" style="z-index:2; position: absolute; left: 0px; top: 0px; width: 100%; height:100%; line-height:' + m + 'px; text-align: center; cursor:hand;">' + (i + 1) + "</div>"))
                }
            }
            h.bind("mouseenter",
            function(r) {
                f.css({
                    opacity: 1
                })
            }).bind("mouseleave", {
                id: i
            },
            function(r) {
                if (r.data.id != q.slide_sel) {
                    f.css({
                        opacity: q.sett.button_opacity
                    })
                }
            }).bind("mousedown",
            function(r) {
                r.stopImmediatePropagation();
                if (i !== q.slide_sel) {
                    f.css({
                        opacity: 1,
                        left: (1 + q.buttonIE) + "px",
                        top: (1 + q.buttonIE) + "px",
                        width: (m - 2) + "px",
                        height: (m - 2) + "px",
                        "background-position": ((i == "next" ? ((m - 30) / 2) - 30 : i == "pause" ? ((m - 30) / 2) - (q.autoPlaying ? 60 : 90) : (m - 30) / 2) - 1) + "px center"
                    });
                    g ? g.css({
                        left: "1px",
                        top: "1px",
                        width: m + "px",
                        height: m + "px"
                    }) : "";
                    if (o) {
                        o.css({
                            height: (m - 4) + "px",
                            "background-position": ((i == "next" ? ((m - 30) / 2) - 30 : i == "pause" ? ((m - 30) / 2) - (q.autoPlaying ? 60 : 90) : (m - 30) / 2) - 1) + "px center"
                        })
                    }
                    if (j) {
                        j.css({
                            top: "-2px"
                        })
                    }
                    c.currentDown = i
                }
            });
            f.css("opacity", this.sett.button_opacity);
            h.appendTo(l);
            h.bg = f;
            h.ih = h.children().eq(1);
            return h
        },
        navigation: function() {
            var n = this;
            var c = this.nav = this;
            c.currentDown = "";
            var k = this.sett.button_size;
            var l = this.sett.button_space;
            var h = this.bW - this.sett.button_margin - (this.sett.caption_float_mode ? 0 : this.sett.caption_margin_x);
            var g = this.bH - this.sett.button_margin - (this.sett.caption_float_mode ? 0 : this.sett.caption_margin_y);
            var m = b("<div></div>", {
                style: "z-index:" + (this.slide_tot + 50) + "; position: absolute; left: " + h + "px; top: " + g + "px;"
            });
            if (this.buttonNext || this.buttonNumber) {
                var j = b("<div></div>", {
                    style: "z-index:4; position: absolute; left: " + ( - k) + "px; top: " + ( - (k + l) * (this.slide_tot + (this.buttonNext ? 1 : 0)) + l) + "px; width: " + k + "px; height: " + ((k + l) * (this.slide_tot + 1) - l) + "px; "
                });
                if (this.sett.button_numbers_horizontal) {
                    j.css({
                        "z-index": 4,
                        position: "absolute",
                        left: ( - (k + l) * (this.slide_tot + (this.buttonNext ? 1 : 0)) + l) + "px",
                        top: ( - k) + "px",
                        width: ((k + l) * (this.slide_tot + (this.buttonNext ? 1 : 0)) - l) + "px",
                        height: k + "px"
                    })
                }
                j.appendTo(m)
            }
            if (this.buttonNext) {
                this.buttonNext = this.createButton(c, j, 4, true, "next").css({
                    left: (this.sett.button_numbers_horizontal ? ((k + l) * this.slide_tot) : 0) - this.buttonIE + "px",
                    top: (this.sett.button_numbers_horizontal ? 0 : ((k + l) * this.slide_tot)) - this.buttonIE + "px"
                });
                if (this.sett.button_numbers_autohide && this.buttonNumber) {
                    this.buttonNext.bind("mouseenter",
                    function(p) {
                        if (!n.numShow) {
                            for (var o = 0; o < n.slide_tot; o++) {
                                clearTimeout(n.buttonLeaveTimer);
                                clearTimeout(n.slides[o].timer);
                                n.showHideButton(o, true)
                            }
                        }
                    });
                    j.bind("mouseleave",
                    function(i) {
                        if (n.numShow) {
                            n.buttonLeaveTimer = setTimeout(function() {
                                n.numShow = false;
                                for (var o = 0; o < n.slide_tot; o++) {
                                    n.showHideButton(o, false)
                                }
                            },
                            300)
                        }
                    }).bind("mouseenter",
                    function(i) {
                        if (n.numShow) {
                            clearTimeout(n.buttonLeaveTimer)
                        }
                    })
                }
            }
            if (this.clockTimer) {
                var e;
                var d;
                if (this.canvasSupport) {
                    this.clockTimer = b('<canvas id="clockTimer" width="' + k + '" height="' + k + '" style="position:absolute; z-index:2;"></canvas>').appendTo(this.sett.button_numbers_horizontal && this.buttonNext ? j: m);
                    this.clockContext = this.clockTimer[0].getContext("2d");
                    this.clockContext.shadowColor = "rgba(0, 0, 0, 0.5)";
                    this.clockContext.shadowBlur = 3;
                    this.clockContext.shadowOffsetX = 0;
                    this.clockContext.shadowOffsetY = 0;
                    this.clockContext.lineWidth = k / 10;
                    this.clockContext.lineCap = "round"
                } else {
                    this.clockTimer = b('<div style="position:absolute; z-index:2; width:' + k + "px; height:" + k + 'px; overflow:hidden"><div style="position:absolute; left: -2px; top:-2px; width:' + (k !== 20 ? (960 * (k / 20 / 1)) : 960) + "px; height:" + (k + 2) + "px; filter : progid:DXImageTransform.Microsoft.AlphaImageLoader(src=" + this.timer_sprite + ", sizingMethod=" + (k !== 20 ? "scale": "noscale") + ') alpha(opacity=100);"></div></div>').appendTo(this.sett.button_numbers_horizontal && this.buttonNext ? j: m)
                }
                if (this.sett.button_numbers_horizontal) {
                    if (this.buttonNext) {
                        if (this.buttonNumber && !this.sett.button_numbers_autohide) {
                            e = -(k + l);
                            d = 0
                        } else {
                            e = (k + l) * (this.slide_tot - 1);
                            d = 0
                        }
                    } else {
                        if (this.buttonNumber && !this.sett.button_numbers_autohide) {
                            e = -((k + l) * (this.slide_tot + 1)) + l;
                            d = -k
                        } else {
                            e = -k;
                            d = -k - this.buttonIE
                        }
                    }
                } else {
                    e = -((k * (this.buttonNext || this.buttonNumber ? 2 : 1)) + (this.buttonNext || this.buttonNumber ? l: 0));
                    d = -k
                }
                this.clockTimer.css({
                    left: (e) + "px",
                    top: (d) + "px"
                });
                this.buttonPause = this.createButton(c, this.sett.button_numbers_horizontal && this.buttonNext ? j: m, 3, true, "pause").css({
                    left: (e - this.buttonIE) + "px",
                    top: (d - this.buttonIE) + "px"
                });
                if (this.autoPlaying) {
                    this.buttonPause.css({
                        opacity: 0
                    })
                } else {
                    this.clockTimer.css({
                        opacity: 0
                    })
                }
                this.buttonPause.bind("mouseenter",
                function(i) {
                    n.buttonPause.stop().animate({
                        opacity: 1
                    },
                    {
                        duration: 400,
                        easing: "easeOutQuad"
                    })
                }).bind("mouseleave",
                function(i) {
                    if (n.autoPlaying) {
                        n.buttonPause.stop().animate({
                            opacity: 0
                        },
                        {
                            duration: 400,
                            easing: "easeOutQuart"
                        })
                    }
                })
            }
            if (this.buttonBack) {
                this.buttonBack = this.createButton(c, this.sett.button_numbers_horizontal && this.buttonNext ? j: m, 1, true, "back");
                if (this.sett.button_numbers_horizontal) {
                    if (this.buttonNext) {
                        if (this.clockTimer) {
                            this.buttonBack.css({
                                left: ((k + l) * (this.slide_tot - 2)) - this.buttonIE + "px",
                                top: ( - this.buttonIE) + "px"
                            })
                        } else {
                            this.buttonBack.css({
                                left: ((k + l) * (this.slide_tot - 1)) - this.buttonIE + "px",
                                top: ( - this.buttonIE) + "px"
                            })
                        }
                    } else {
                        if (this.clockTimer) {
                            this.buttonBack.css({
                                left: (parseInt(this.clockTimer.css("left"), 10) - k - l) - this.buttonIE + "px",
                                top: parseInt(this.clockTimer.css("top"), 10) - this.buttonIE
                            })
                        } else {
                            this.buttonBack.css({
                                left: ( - k) + "px",
                                top: ( - k - this.buttonIE) + "px"
                            })
                        }
                    }
                } else {
                    if (this.clockTimer) {
                        this.buttonBack.css({
                            left: (( - (k + l) * (this.buttonNext ? 3 : 2)) + l) - this.buttonIE + "px",
                            top: -(k) - this.buttonIE + "px"
                        })
                    } else {
                        this.buttonBack.css({
                            left: -((k * (this.buttonNext || this.buttonNumber ? 2 : 1)) + (this.buttonNext || this.buttonNumber ? l: 0)) - this.buttonIE + "px",
                            top: -(k) - this.buttonIE + "px"
                        })
                    }
                }
            }
            if (this.buttonNumber) {
                for (var f = 0; f < this.slide_tot; f++) {
                    this.slides[f].butt = this.createButton(c, j, this.slide_tot - f + 5, false, f);
                    this.slides[f].buttBG = this.slides[f].butt.bg;
                    this.slides[f].buttIH = this.slides[f].butt.ih;
                    if (this.sett.button_numbers_horizontal) {
                        this.slides[f].butt.css({
                            top: ( - this.buttonIE) + "px",
                            left: ((k + l) * f) - this.buttonIE + "px"
                        })
                    } else {
                        this.slides[f].butt.css({
                            left: ( - this.buttonIE) + "px",
                            top: ((k + l) * f) - this.buttonIE + "px"
                        })
                    }
                    if (f == this.slide_sel) {
                        this.slides[f].buttBG.css({
                            opacity: 1
                        })
                    }
                    this.slides[f].butt.hide()
                }
            }
            b(document).bind("mouseup",
            function() {
                if (c.currentDown == "next") {
                    if ((n.sett.slide_transition == "fade" && n.slide_fin) || (n.sett.slide_transition != "fade" && ((n.slide_dir < 0 && n.slides[n.slide_sel].con.position().left < n.bW / 2) || (n.slide_dir > 0 && n.slides[n.slide_sel].con.position().left > -n.bW / 2)))) {
                        n.slide_dir = -1;
                        n.changeSlide("next")
                    }
                    if (n.sett.button_show_numbers) {
                        n.toggleButton()
                    } else {
                        n.timerReset(false)
                    }
                    n.buttonNext.bg.css({
                        opacity: 1,
                        left: (n.buttonIE) + "px",
                        top: (n.buttonIE) + "px",
                        width: k + "px",
                        height: k + "px",
                        "background-position": (((k - 30) / 2) - 30) + "px center"
                    });
                    n.buttonNext.ih.css({
                        left: "0px",
                        top: "0px",
                        width: k + 2 + "px",
                        height: k + 2 + "px"
                    });
                    n.buttonNext.find("#iconHolder").css({
                        height: (k - 2) + "px",
                        "background-position": (((k - 30) / 2) - 30) + "px center"
                    })
                } else {
                    if (c.currentDown == "back") {
                        if ((n.sett.slide_transition == "fade" && n.slide_fin) || (n.sett.slide_transition != "fade" && ((n.slide_dir < 0 && n.slides[n.slide_sel].con.position().left < n.bW / 2) || (n.slide_dir > 0 && n.slides[n.slide_sel].con.position().left > -n.bW / 2)))) {
                            n.slide_dir = 1;
                            n.changeSlide("back")
                        }
                        if (n.sett.button_show_numbers) {
                            n.toggleButton()
                        } else {
                            n.timerReset(false)
                        }
                        n.buttonBack.bg.css({
                            opacity: 1,
                            left: (n.buttonIE) + "px",
                            top: (n.buttonIE) + "px",
                            width: k + "px",
                            height: k + "px",
                            "background-position": ((k - 30) / 2) + "px center"
                        });
                        n.buttonBack.ih.css({
                            left: "0px",
                            top: "0px",
                            width: k + 2 + "px",
                            height: k + 2 + "px"
                        });
                        n.buttonBack.find("#iconHolder").css({
                            height: (k - 2) + "px",
                            "background-position": ((k - 30) / 2) + "px center"
                        })
                    } else {
                        if (c.currentDown == "pause") {
                            if (n.autoPlaying) {
                                n.autoPlaying = false;
                                n.buttonPause.css({
                                    opacity: 1
                                });
                                n.clockTimer.css({
                                    opacity: 0
                                });
                                n.timerReset(true)
                            } else {
                                n.autoPlaying = true;
                                n.buttonPause.stop().animate({
                                    opacity: 0
                                },
                                {
                                    duration: 400,
                                    easing: "easeOutQuart"
                                });
                                n.clockTimer.css({
                                    opacity: 1
                                });
                                n.startDelayTimer()
                            }
                            n.buttonPause.bg.css({
                                opacity: 1,
                                left: (n.buttonIE) + "px",
                                top: (n.buttonIE) + "px",
                                width: k + "px",
                                height: k + "px",
                                "background-position": (((k - 30) / 2) - (n.autoPlaying ? 60 : 90)) + "px center"
                            });
                            n.buttonPause.ih.css({
                                left: "0px",
                                top: "0px",
                                width: k + 2 + "px",
                                height: k + 2 + "px"
                            });
                            n.buttonPause.find("#iconHolder").css({
                                height: (k - 2) + "px",
                                "background-position": (((k - 30) / 2) - (n.autoPlaying ? 60 : 90)) + "px center"
                            })
                        } else {
                            if (c.currentDown !== "") {
                                if (n.slide_sel !== c.currentDown) {
                                    if ((n.sett.slide_transition == "fade" && n.slide_fin) || (n.sett.slide_transition != "fade" && ((n.slide_dir < 0 && n.slides[n.slide_sel].con.position().left < n.bW / 2) || (n.slide_dir > 0 && n.slides[n.slide_sel].con.position().left > -n.bW / 2)))) {
                                        if (c.currentDown > n.slide_sel) {
                                            n.slide_dir = -1
                                        } else {
                                            if (c.currentDown < n.slide_sel) {
                                                n.slide_dir = 1
                                            }
                                        }
                                        n.changeSlide(c.currentDown)
                                    }
                                }
                                if (n.sett.button_show_numbers) {
                                    n.toggleButton()
                                } else {
                                    n.timerReset(false)
                                }
                                var i = n.slides[n.slide_sel].butt.find("#iconHolder");
                                if (i) {
                                    i.css({
                                        height: (k - 2) + "px"
                                    });
                                    i.children().eq(0).css({
                                        top: "-1px"
                                    })
                                }
                            }
                        }
                    }
                }
                c.currentDown = ""
            });
            return m
        },
        startDelayTimer: function() {
            var c = this;
            if (this.clockPlaying) {
                this.timerob.stop()
            }
            if (this.clockTimer) {
                this.clockTimer.stop()
            }
            this.clockPlaying = true;
            this.timerob.css("left", "0px");
            this.timerob.animate({
                left: "780px"
            },
            {
                easing: "linear",
                duration: this.slides[this.slide_sel].delay,
                queue: false,
                step: function(d, e) {
                    if (c.sett.button_show_timer) {
                        if (c.canvasSupport) {
                            c.clockContext.clearRect(0, 0, c.sett.button_size, c.sett.button_size);
                            c.clockContext.strokeStyle = "rgba(255, 255, 255, .4)";
                            c.clockContext.beginPath();
                            c.clockContext.arc(c.sett.button_size / 2, c.sett.button_size / 2, (c.sett.button_size / 2) - (c.sett.button_size / 10), 0, Math.PI * 2, true);
                            c.clockContext.stroke();
                            c.clockContext.closePath();
                            c.clockContext.strokeStyle = "rgba(255, 255, 255, .85)";
                            c.clockContext.beginPath();
                            c.clockContext.arc(c.sett.button_size / 2, c.sett.button_size / 2, (c.sett.button_size / 2) - (c.sett.button_size / 10), (Math.PI * 2 * (d / 780)) - (Math.PI / 2), -Math.PI / 2, true);
                            c.clockContext.stroke();
                            c.clockContext.closePath()
                        } else {
                            var f = (parseInt(d / 780 * 39, 10) * -(24 * c.sett.button_size / 20)) - 2;
                            f < -(39 * (24 * c.sett.button_size / 20)) - 2 ? f = -2 : "";
                            c.clockTimer.children().eq(0).css({
                                left: f + "px"
                            })
                        }
                    }
                },
                complete: function() {
                    c.clockPlaying = false;
                    if (!c.slide_drg) {
                        c.slide_dir = -1;
                        c.changeSlide("next");
                        if (c.sett.button_show_numbers) {
                            c.toggleButton()
                        } else {
                            c.timerReset(false)
                        }
                    }
                }
            })
        },
        timerReset: function(d) {
            var c = this;
            if (this.clockPlaying) {
                this.timerob.stop()
            }
            if (this.autoPlaying) {
                if (d) {
                    if (this.clockTimer) {
                        this.clockTimer.stop();
                        if (this.canvasSupport) {
                            c.clockContext.clearRect(0, 0, c.sett.button_size, c.sett.button_size);
                            c.clockContext.strokeStyle = "rgba(255, 255, 255, .4)";
                            c.clockContext.beginPath();
                            c.clockContext.arc(c.sett.button_size / 2, c.sett.button_size / 2, (c.sett.button_size / 2) - (c.sett.button_size / 10), 0, Math.PI * 2, true);
                            c.clockContext.stroke();
                            c.clockContext.closePath();
                            c.clockTimer.css({
                                opacity: 1
                            })
                        } else {
                            c.clockTimer.children().eq(0).css({
                                left: "-2px"
                            });
                            c.clockTimer.css({
                                filter: "none"
                            })
                        }
                    }
                } else {
                    if (this.clockTimer) {
                        if (this.canvasSupport) {
                            this.clockTimer.stop().fadeTo(300, 0.4,
                            function() {
                                c.clockContext.clearRect(0, 0, c.sett.button_size, c.sett.button_size);
                                c.clockContext.strokeStyle = "rgba(255, 255, 255, .4)";
                                c.clockContext.beginPath();
                                c.clockContext.arc(c.sett.button_size / 2, c.sett.button_size / 2, 8, 0, Math.PI * 2, true);
                                c.clockContext.stroke();
                                c.clockContext.closePath();
                                c.clockTimer.css({
                                    opacity: 1
                                })
                            })
                        } else {
                            this.clockTimer.stop().fadeTo(300, 0.4,
                            function() {
                                c.clockTimer.children().eq(0).css({
                                    left: "-2px"
                                });
                                c.clockTimer.css({
                                    filter: "none"
                                })
                            })
                        }
                    }
                }
            }
        },
        toggleButton: function() {
            for (var c = 0; c < this.slide_tot; c++) {
                this.slides[c].buttBG.css({
                    opacity: this.sett.button_opacity
                });
                this.slides[c].buttBG.css({
                    opacity: this.sett.button_opacity,
                    left: (this.buttonIE) + "px",
                    top: (this.buttonIE) + "px",
                    width: this.sett.button_size + "px",
                    height: this.sett.button_size + "px"
                })
            }
            this.timerReset(false);
            this.slides[this.slide_sel].buttBG.css({
                opacity: 1,
                left: (this.buttonIE) + "px",
                top: (this.buttonIE) + "px",
                width: this.sett.button_size + "px",
                height: this.sett.button_size + "px"
            });
            this.buttonIE > 0 ? this.slides[this.slide_sel].buttIH.css({
                left: "0px",
                top: "0px",
                width: this.sett.button_size + 2 + "px",
                height: this.sett.button_size + 2 + "px"
            }) : ""
        },
        showHideButton: function(g, j) {
            var p = this;
            var n = this.sett.button_size;
            var o = this.sett.button_space;
            var h, c, l, m, d, f, k, e;
            d = p.slides[g].butt;
            clearTimeout(this.buttonLeaveTimer);
            clearTimeout(p.slides[g].timer);
            f = d.bg;
            k = d.ih;
            d.stop();
            if (j) {
                p.numShow = true;
                p.slides[g].butt.show();
                if (d.css("opacity") == 1) {
                    d.css("opacity", 0)
                }
                h = (p.slide_tot - g) * (100 / p.slide_tot);
                c = 20 + ((p.slide_tot - g) * (300 / p.slide_tot));
                l = 1;
                m = 3
            } else {
                h = g * (150 / p.slide_tot);
                c = 20 + (g * (150 / p.slide_tot));
                l = 0;
                m = 8
            }
            p.slides[g].timer = setTimeout(function() {
                d.animate({
                    opacity: l
                },
                {
                    duration: c,
                    step: function(i, t) {
                        var u = parseInt((n / m) - (n / m * i), 10);
                        var q = n - (u * 2);
                        f.css({
                            width: q,
                            height: q,
                            left: u + p.buttonIE,
                            top: u + p.buttonIE
                        });
                        p.buttonIE > 0 ? k.css({
                            width: q + 2,
                            height: q + 2,
                            left: u,
                            top: u
                        }) : "";
                        var r = f.find("#iconHolder");
                        if (r) {
                            r.css({
                                height: (q - 2) + "px"
                            });
                            r.children().eq(0).css({
                                top: ( - u - 1) + "px"
                            })
                        }
                        if (p.sett.button_numbers_horizontal) {
                            if (p.clockTimer) {
                                if (g == p.slide_tot - 1) {
                                    if (j) {
                                        if (p.buttonNext) {
                                            p.clockTimer.css({
                                                left: ( - (n + o) * i) + "px",
                                                top: "0px"
                                            })
                                        }
                                    } else {
                                        p.clockTimer.css("left", (((n + o) * (p.slide_tot - 1) * (1 - i)) + (n + o) * i) + "px")
                                    }
                                    if (p.buttonBack) {
                                        p.buttonBack.css("left", (p.clockTimer.position().left - n - o) - p.buttonIE + "px")
                                    }
                                }
                                p.buttonPause.css({
                                    left: parseInt(p.clockTimer.css("left"), 10) - p.buttonIE,
                                    top: parseInt(p.clockTimer.css("top"), 10) - p.buttonIE
                                })
                            } else {
                                if (g == p.slide_tot - 1) {
                                    if (p.buttonBack) {
                                        if (j) {
                                            if (p.buttonNext) {
                                                p.buttonBack.css("left", ( - (i * (n + o))) - p.buttonIE + "px")
                                            }
                                        } else {
                                            if (p.buttonNext) {
                                                p.buttonBack.css("left", (((n + o) * (p.slide_tot - 1) * (1 - i)) + (n + o) * i) - p.buttonIE + "px")
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    complete: function() {
                        if (!j) {
                            p.slides[g].butt.hide()
                        }
                    }
                })
            },
            h)
        },
        move: function() {
            var c = this;
            var e = this.slide_sel;
            this.zSort(2, 1);
            if (this.slides[e].txt) {
                this.slides[e].cap.hide();
                if (this.sett.caption_float_mode) {
                    this.slides[e].cap.css("left", (this.IE8 ? this.slides[e].cx: this.slides[e].cx + (100 * -this.slide_dir)) + "px")
                }
            }
            if (this.slide_pr1 !== "") {
                if (this.slides[this.slide_pr1].txt) {
                    this.textOut()
                }
            }
            this.slide_drg = false;
            this.slide_fin = false;
            var d = false;
            this.slide_playing = true;
            this.slides[e].con.stop().show().css({
                left: (this.slide_pr1 !== "" ? this.slides[this.slide_pr1].con.position().left + ( - this.bW * this.slide_dir) : -this.bW * this.slide_dir)
            }).animate({
                left: "0px"
            },
            {
                duration: c.sett.slide_transition_period + 100,
                easing: "easeInOutQuart",
                step: function(f, g) {
                    if (c.slide_pr1 !== "" && c.slide_pr1 !== e) {
                        c.slides[c.slide_pr1].con.stop().css({
                            left: f + (c.bW * c.slide_dir)
                        })
                    }
                    if (c.slide_pr2 !== "" && c.slide_pr2 !== e && c.slide_pr2 !== c.slide_pr1) {
                        c.slides[c.slide_pr2].con.stop().css({
                            left: f + (c.bW * 2 * c.slide_dir)
                        })
                    }
                },
                complete: function() {
                    c.slide_fin = true;
                    if (c.slide_sta) {
                        c.slide_sta = false;
                        c.$cont.css("background-image", "none")
                    }
                    if (e == c.slide_sel && c.slides[e].txt) {
                        c.animateCaption()
                    }
                    if (c.autoPlaying) {
                        c.startDelayTimer()
                    }
                }
            })
        },
        fade: function() {
            var c = this;
            var e = this.slide_sel;
            this.zSort(2, 1);
            if (this.slides[e].txt) {
                this.slides[e].con.show();
                this.slides[e].cap.hide();
                if (this.sett.caption_float_mode) {
                    this.slides[e].cap.css("left", (this.IE8 ? this.slides[e].cx: this.slides[e].cx + (100 * -this.slide_dir)) + "px")
                }
            }
            if (this.slide_pr1 !== "") {
                if (this.slides[this.slide_pr1].txt) {
                    this.textOut()
                }
            }
            this.slide_drg = false;
            this.slide_fin = false;
            var d = false;
            this.slide_playing = true;
            this.slides[e].con.stop().hide().css("left", "0px").fadeIn({
                duration: c.sett.slide_transition_period + 100,
                easing: "easeInOutQuart",
                complete: function() {
                    c.slide_fin = true;
                    if (c.slide_sta) {
                        c.slide_sta = false;
                        c.$cont.css("background-image", "none")
                    }
                    if (e == c.slide_sel && c.slides[e].txt) {
                        c.animateCaption()
                    }
                    if (c.autoPlaying) {
                        c.startDelayTimer()
                    }
                }
            })
        },
        slideIn: function() {
            var c = this;
            var e = this.slide_sel;
            this.zSort(2, 1);
            if (this.slides[e].txt) {
                this.slides[e].cap.hide();
                if (this.sett.caption_float_mode) {
                    this.slides[e].cap.css("left", (this.IE8 ? this.slides[e].cx: this.slides[e].cx + (100 * -this.slide_dir)) + "px")
                }
                if (this.IE8) {
                    this.slides[e].txt.stop().clearQueue();
                    this.slides[e].cap.stop().clearQueue()
                }
            }
            if (this.slide_pr1 !== "") {
                if (this.slides[this.slide_pr1].txt) {
                    this.textOut()
                }
            }
            this.slide_drg = false;
            this.slide_fin = false;
            var d = false;
            this.slide_playing = true;
            this.slides[e].con.stop().clearQueue().show().css({
                left: (this.slide_dir < 0 ? this.bW + 30 : -this.bW - 30) + "px"
            });
            this.slides[e].con.css(this.shProp, "0px 0px 45px 0px #000000");
            this.slides[e].con.stop().clearQueue().animate({
                left: "0px"
            },
            {
                duration: c.sett.slide_transition_period + 100,
                easing: "easeInOutQuart",
                complete: function() {
                    c.slide_fin = true;
                    if (c.slide_sta) {
                        c.slide_sta = false;
                        c.$cont.css("background-image", "none")
                    }
                    if (e == c.slide_sel && c.slides[e].txt) {
                        c.animateCaption()
                    }
                    if (c.autoPlaying) {
                        c.startDelayTimer()
                    }
                    c.slides[e].con.css(c.shProp, "none")
                }
            })
        },
        slideOut: function() {
            var c = this;
            var e = this.slide_sel;
            this.zSort(1, 2);
            if (this.slides[e].txt) {
                this.slides[e].cap.hide();
                if (this.sett.caption_float_mode) {
                    this.slides[e].cap.css("left", (this.IE8 ? this.slides[e].cx: this.slides[e].cx + (100 * -this.slide_dir)) + "px")
                }
            }
            if (this.slide_pr1 !== "") {
                if (this.slides[this.slide_pr1].txt) {
                    this.textOut()
                }
            }
            this.slide_drg = false;
            this.slide_fin = false;
            var d = false;
            this.slide_playing = true;
            if (this.slide_pr1 !== "") {
                this.slides[e].con.stop().clearQueue().show().css({
                    left: "0px"
                });
                if (this.IE8 && this.slides[e].txt) {
                    this.slides[this.slide_pr1].txt.stop().clearQueue();
                    this.slides[this.slide_pr1].cap.stop().clearQueue()
                }
                this.slides[e].con.css(this.shProp, "0px 0px 45px 0px #000000");
                this.slides[this.slide_pr1].con.stop().clearQueue().animate({
                    left: this.slide_dir * (this.bW + 30)
                },
                {
                    duration: c.sett.slide_transition_period,
                    easing: "easeInOutQuart",
                    complete: function() {
                        c.slide_fin = true;
                        if (c.slide_sta) {
                            c.slide_sta = false;
                            c.$cont.css("background-image", "none")
                        }
                        if (e == c.slide_sel && c.slides[e].txt) {
                            c.animateCaption()
                        }
                        if (c.autoPlaying) {
                            c.startDelayTimer()
                        }
                        c.slides[c.slide_pr1].con.css(c.shProp, "none")
                    }
                })
            } else {
                this.slides[e].con.stop().show().clearQueue().css({
                    left: this.bW + "px"
                }).animate({
                    left: "0px"
                },
                {
                    duration: c.sett.slide_transition_period,
                    easing: "easeInOutQuart",
                    complete: function() {
                        c.slide_fin = true;
                        if (e == c.slide_sel && c.slides[e].txt) {
                            c.animateCaption()
                        }
                        if (c.autoPlaying) {
                            c.startDelayTimer()
                        }
                    }
                })
            }
        }
    };
    b.fn.TransBanner = function(c) {
        return this.each(function() {
            var d = b(this);
            if (!d.data("TransBanner")) {
                d.data("TransBanner", new a(d, c))
            }
        })
    }
})(jQuery);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/*
 *
 *  jQuery $.getImageData Plugin 0.3
 *  http://www.maxnov.com/getimagedata
 *  
 *  Written by Max Novakovic (http://www.maxnov.com/)
 *  Date: Thu Jan 13 2011
 *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *  
 *  Includes jQuery JSONP Core Plugin 2.1.4
 *  http://code.google.com/p/jquery-jsonp/
 *  Copyright 2010, Julian Aubourg
 *  Released under the MIT License.
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *  
 *  Copyright 2011, Max Novakovic
 *  Dual licensed under the MIT or GPL Version 2 licenses.
 *  http://www.maxnov.com/getimagedata/#license
 * 
 */
(function(c, g) {
    function n() {}
    function o(a) {
        s = [a]
    }
    function e(a, j, k) {
        return a && a.apply(j.context || j, k)
    }
    function h(a) {
        function j(b) { ! l++&&g(function() {
                p();
                q && (t[d] = {
                    s: [b]
                });
                z && (b = z.apply(a, [b]));
                e(a.success, a, [b, A]);
                e(B, a, [a, A])
            },
            0)
        }
        function k(b) { ! l++&&g(function() {
                p();
                q && b != C && (t[d] = b);
                e(a.error, a, [a, b]);
                e(B, a, [a, b])
            },
            0)
        }
        a = c.extend({},
        D, a);
        var B = a.complete,
        z = a.dataFilter,
        E = a.callbackParameter,
        F = a.callback,
        R = a.cache,
        q = a.pageCache,
        G = a.charset,
        d = a.url,
        f = a.data,
        H = a.timeout,
        r, l = 0,
        p = n;
        a.abort = function() { ! l++&&p()
        };
        if (e(a.beforeSend, a, [a]) === false || l) return a;
        d = d || u;
        f = f ? typeof f == "string" ? f: c.param(f, a.traditional) : u;
        d += f ? (/\?/.test(d) ? "&": "?") + f: u;
        E && (d += (/\?/.test(d) ? "&": "?") + encodeURIComponent(E) + "=?"); ! R && !q && (d += (/\?/.test(d) ? "&": "?") + "_" + (new Date).getTime() + "=");
        d = d.replace(/=\?(&|$)/, "=" + F + "$1");
        q && (r = t[d]) ? r.s ? j(r.s[0]) : k(r) : g(function(b, m, v) {
            if (!l) {
                v = H > 0 && g(function() {
                    k(C)
                },
                H);
                p = function() {
                    v && clearTimeout(v);
                    b[I] = b[w] = b[J] = b[x] = null;
                    i[K](b);
                    m && i[K](m)
                };
                window[F] = o;
                b = c(L)[0];
                b.id = M + S++;
                if (G) b[T] = G;
                var O = function(y) { (b[w] || n)();
                    y = s;
                    s = undefined;
                    y ? j(y[0]) : k(N)
                };
                if (P.msie) {
                    b.event = w;
                    b.htmlFor = b.id;
                    b[I] = function() { / loaded | complete / .test(b.readyState) && O()
                    }
                } else {
                    b[x] = b[J] = O;
                    P.opera ? (m = c(L)[0]).text = "jQuery('#" + b.id + "')[0]." + x + "()": b[Q] = Q
                }
                b.src = d;
                i.insertBefore(b, i.firstChild);
                m && i.insertBefore(m, i.firstChild)
            }
        },
        0);
        return a
    }
    var Q = "async",
    T = "charset",
    u = "",
    N = "error",
    M = "_jqjsp",
    w = "onclick",
    x = "on" + N,
    J = "onload",
    I = "onreadystatechange",
    K = "removeChild",
    L = "<script/>",
    A = "success",
    C = "timeout",
    P = c.browser,
    i = c("head")[0] || document.documentElement,
    t = {},
    S = 0,
    s,
    D = {
        callback: M,
        url: location.href
    };
    h.setup = function(a) {
        c.extend(D, a)
    };
    c.jsonp = h
})(jQuery, setTimeout); (function(c) {
    c.getImageData = function(a) {
        var f = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (a.url) {
            var g = location.protocol === "https:",
            e = "";
            e = a.server && f.test(a.server) && a.server.indexOf("https:") && (g || a.url.indexOf("https:")) ? a.server: "//img-to-json.appspot.com/?callback=?";
            c.jsonp({
                url: e,
                data: {
                    url: escape(a.url)
                },
                dataType: "jsonp",
                timeout: 1E4,
                success: function(b) {
                    var d = new Image;
                    c(d).load(function() {
                        this.width = b.width;
                        this.height = b.height;
                        typeof a.success == typeof Function && a.success(this)
                    }).attr("src", b.data)
                },
                error: function(b, d) {
                    typeof a.error == typeof Function && a.error(b, d)
                }
            })
        } else typeof a.error == typeof Function && a.error(null, "no_url")
    }
})(jQuery);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Below is Mario Klingemann's Superfast Blur. Note that this is Modified version that made to work with Translucent Banner.

Superfast Blur - a fast Box Blur For Canvas

Version: 	0.5
Author:		Mario Klingemann
Contact: 	mario@quasimondo.com
Website:	http://www.quasimondo.com/BoxBlurForCanvas
Twitter:	@quasimondo

In case you find this class useful - especially in commercial projects -
I am not totally unhappy for a small donation to my PayPal account
mario@quasimondo.de

Or support me on flattr:
https://flattr.com/thing/140066/Superfast-Blur-a-pretty-fast-Box-Blur-Effect-for-CanvasJavascript

Copyright (c) 2011 Mario Klingemann

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/
var mul_table = [1, 57, 41, 21, 203, 34, 97, 73, 227, 91, 149, 62, 105, 45, 39, 137, 241, 107, 3, 173, 39, 71, 65, 238, 219, 101, 187, 87, 81, 151, 141, 133, 249, 117, 221, 209, 197, 187, 177, 169, 5, 153, 73, 139, 133, 127, 243, 233, 223, 107, 103, 99, 191, 23, 177, 171, 165, 159, 77, 149, 9, 139, 135, 131, 253, 245, 119, 231, 224, 109, 211, 103, 25, 195, 189, 23, 45, 175, 171, 83, 81, 79, 155, 151, 147, 9, 141, 137, 67, 131, 129, 251, 123, 30, 235, 115, 113, 221, 217, 53, 13, 51, 50, 49, 193, 189, 185, 91, 179, 175, 43, 169, 83, 163, 5, 79, 155, 19, 75, 147, 145, 143, 35, 69, 17, 67, 33, 65, 255, 251, 247, 243, 239, 59, 29, 229, 113, 111, 219, 27, 213, 105, 207, 51, 201, 199, 49, 193, 191, 47, 93, 183, 181, 179, 11, 87, 43, 85, 167, 165, 163, 161, 159, 157, 155, 77, 19, 75, 37, 73, 145, 143, 141, 35, 138, 137, 135, 67, 33, 131, 129, 255, 63, 250, 247, 61, 121, 239, 237, 117, 29, 229, 227, 225, 111, 55, 109, 216, 213, 211, 209, 207, 205, 203, 201, 199, 197, 195, 193, 48, 190, 47, 93, 185, 183, 181, 179, 178, 176, 175, 173, 171, 85, 21, 167, 165, 41, 163, 161, 5, 79, 157, 78, 154, 153, 19, 75, 149, 74, 147, 73, 144, 143, 71, 141, 140, 139, 137, 17, 135, 134, 133, 66, 131, 65, 129, 1];
var shg_table = [0, 9, 10, 10, 14, 12, 14, 14, 16, 15, 16, 15, 16, 15, 15, 17, 18, 17, 12, 18, 16, 17, 17, 19, 19, 18, 19, 18, 18, 19, 19, 19, 20, 19, 20, 20, 20, 20, 20, 20, 15, 20, 19, 20, 20, 20, 21, 21, 21, 20, 20, 20, 21, 18, 21, 21, 21, 21, 20, 21, 17, 21, 21, 21, 22, 22, 21, 22, 22, 21, 22, 21, 19, 22, 22, 19, 20, 22, 22, 21, 21, 21, 22, 22, 22, 18, 22, 22, 21, 22, 22, 23, 22, 20, 23, 22, 22, 23, 23, 21, 19, 21, 21, 21, 23, 23, 23, 22, 23, 23, 21, 23, 22, 23, 18, 22, 23, 20, 22, 23, 23, 23, 21, 22, 20, 22, 21, 22, 24, 24, 24, 24, 24, 22, 21, 24, 23, 23, 24, 21, 24, 23, 24, 22, 24, 24, 22, 24, 24, 22, 23, 24, 24, 24, 20, 23, 22, 23, 24, 24, 24, 24, 24, 24, 24, 23, 21, 23, 22, 23, 24, 24, 24, 22, 24, 24, 24, 23, 22, 24, 24, 25, 23, 25, 25, 23, 24, 25, 25, 24, 22, 25, 25, 25, 24, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 23, 25, 23, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 24, 22, 25, 25, 23, 25, 25, 20, 24, 25, 24, 25, 25, 22, 24, 25, 24, 25, 24, 25, 25, 24, 25, 25, 25, 25, 22, 25, 25, 25, 24, 25, 24, 25, 18];
function boxBlurImage(k, g, o, n, j, i, e, c, d, m, a, f) {
    var p = n;
    var l = j;
    d.style.width = p + "px";
    d.style.height = l + "px";
    d.width = p;
    d.height = l;
    var b = d.getContext("2d");
    b.clearRect(0, 0, p, l);
    b.scale(i, i);
    b.drawImage(k, ( - g + (e !== "" ? e: 0)) / i, ( - o + (c !== "" ? c: 0)) / i);
    if (isNaN(m) || m < 1) {
        return
    }
    boxBlurCanvasRGB(d, 0, 0, p, l, m, f);
    b.restore()
}
function boxBlurCanvasRGB(m, w, v, a, d, D, H) {
    if (isNaN(D) || D < 1) {
        return
    }
    D |= 0;
    if (isNaN(H)) {
        H = 1
    }
    H |= 0;
    if (H > 3) {
        H = 3
    }
    if (H < 1) {
        H = 1
    }
    var R = m.getContext("2d");
    var G;
    try {
        try {
            G = R.getImageData(w, v, a, d)
        } catch(N) {
            try {
                netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                G = R.getImageData(w, v, a, d)
            } catch(N) {
                return
            }
        }
    } catch(N) {
        return
    }
    var k = G.data;
    var j, A, z, l, C, B, I, F, O, M, o, s, n, P;
    var c = a - 1;
    var L = d - 1;
    var f = a * d;
    var t = D + 1;
    var E = [];
    var K = [];
    var Q = [];
    var u = mul_table[D];
    var h = shg_table[D];
    var q = [];
    var J = [];
    while (H-->0) {
        n = s = 0;
        for (B = 0; B < d; B++) {
            j = k[n] * t;
            A = k[n + 1] * t;
            z = k[n + 2] * t;
            for (I = 1; I <= D; I++) {
                F = n + (((I > c ? c: I)) << 2);
                j += k[F++];
                A += k[F++];
                z += k[F++]
            }
            for (C = 0; C < a; C++) {
                E[s] = j;
                K[s] = A;
                Q[s] = z;
                if (B == 0) {
                    q[C] = ((F = C + t) < c ? F: c) << 2;
                    J[C] = ((F = C - D) > 0 ? F << 2 : 0)
                }
                O = n + q[C];
                M = n + J[C];
                j += k[O++] - k[M++];
                A += k[O++] - k[M++];
                z += k[O++] - k[M++];
                s++
            }
            n += (a << 2)
        }
        for (C = 0; C < a; C++) {
            o = C;
            j = E[o] * t;
            A = K[o] * t;
            z = Q[o] * t;
            for (I = 1; I <= D; I++) {
                o += (I > L ? 0 : a);
                j += E[o];
                A += K[o];
                z += Q[o]
            }
            s = C << 2;
            for (B = 0; B < d; B++) {
                k[s] = (j * u) >>> h;
                k[s + 1] = (A * u) >>> h;
                k[s + 2] = (z * u) >>> h;
                if (C == 0) {
                    q[B] = ((F = B + t) < L ? F: L) * a;
                    J[B] = ((F = B - D) > 0 ? F * a: 0)
                }
                O = C + q[B];
                M = C + J[B];
                j += E[O] - E[M];
                A += K[O] - K[M];
                z += Q[O] - Q[M];
                s += a << 2
            }
        }
    }
    R.putImageData(G, w, v)
};