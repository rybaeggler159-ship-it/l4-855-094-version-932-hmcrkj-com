(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-button]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var backdrop = hero.querySelector("[data-hero-backdrop]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
            if (backdrop && slides[current]) {
                var cover = slides[current].getAttribute("data-cover");
                if (cover) {
                    backdrop.style.backgroundImage = "url('" + cover + "')";
                }
            }
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var queryInput = root.querySelector("[data-filter-query]");
            var typeSelect = root.querySelector("[data-filter-select='type']");
            var decadeSelect = root.querySelector("[data-filter-select='decade']");
            var clearButton = root.querySelector("[data-clear-filters]");
            var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
            var countNode = root.querySelector("[data-visible-count]");
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");

            if (initialQuery && queryInput) {
                queryInput.value = initialQuery;
            }

            function apply() {
                var query = queryInput ? queryInput.value.trim().toLowerCase() : "";
                var type = typeSelect ? typeSelect.value : "";
                var decade = decadeSelect ? decadeSelect.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var searchable = card.getAttribute("data-search") || "";
                    var cardType = card.getAttribute("data-type") || "";
                    var cardDecade = card.getAttribute("data-decade") || "";
                    var matched = true;

                    if (query && searchable.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (type && cardType !== type) {
                        matched = false;
                    }
                    if (decade && cardDecade !== decade) {
                        matched = false;
                    }

                    card.classList.toggle("is-hidden", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (countNode) {
                    countNode.textContent = String(visible);
                }
            }

            if (queryInput) {
                queryInput.addEventListener("input", apply);
            }
            if (typeSelect) {
                typeSelect.addEventListener("change", apply);
            }
            if (decadeSelect) {
                decadeSelect.addEventListener("change", apply);
            }
            if (clearButton) {
                clearButton.addEventListener("click", function () {
                    if (queryInput) {
                        queryInput.value = "";
                    }
                    if (typeSelect) {
                        typeSelect.value = "";
                    }
                    if (decadeSelect) {
                        decadeSelect.value = "";
                    }
                    apply();
                });
            }
            apply();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-start]");
            var status = player.querySelector("[data-player-status]");
            var src = player.getAttribute("data-video-src");
            var initialized = false;
            var hlsInstance = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function initialize() {
                if (initialized || !video || !src) {
                    return Promise.resolve();
                }
                initialized = true;
                setStatus("正在初始化 HLS 播放源...");

                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源加载完成");
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setStatus("视频加载失败，请刷新或稍后重试");
                        }
                    });
                    return Promise.resolve();
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                    setStatus("浏览器原生 HLS 播放");
                    return Promise.resolve();
                }

                setStatus("当前浏览器不支持 HLS 播放");
                return Promise.reject(new Error("HLS is not supported"));
            }

            function play() {
                initialize().then(function () {
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.then === "function") {
                        playPromise.then(function () {
                            player.classList.add("is-playing");
                            setStatus("正在播放");
                        }).catch(function () {
                            player.classList.remove("is-playing");
                            setStatus("请再次点击播放按钮");
                        });
                    } else {
                        player.classList.add("is-playing");
                        setStatus("正在播放");
                    }
                }).catch(function () {
                    player.classList.remove("is-playing");
                });
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (video) {
                video.addEventListener("play", function () {
                    player.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    player.classList.remove("is-playing");
                    setStatus("已暂停");
                });
            }

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
