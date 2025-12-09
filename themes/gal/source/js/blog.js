(function ($) {

	// ------- 处理搜索侧边栏 -----------

	var searchForm = $('#search-form');
	var searchSubmit = searchForm.find('.btn-gal')
	searchSubmit.each(function () {
		$(this).on('click', function (event) {
			var searchInput = $(this).prev()
			var input = searchInput.val().trim()
			if(input === null || input === '') {
				event.preventDefault();
				searchInput.focus()
			}
		})
	})
	
	// ------- 处理搜索侧边栏结束 --------

	// ------- 处理背景图 --------------

	var cdSlideShow = $('.cb-slideshow')
	var useApi = window.slideConfig.useApi
	var apiUrls = window.slideConfig.apiUrls || []
	var apiCount = window.slideConfig.apiCount || 6

	if (useApi && apiUrls.length > 0) {
		// API模式：预加载图片池 + 纯JS控制轮播（禁用CSS动画）
		var imagePool = []           // 已缓存的图片URL池
		var loadingCount = 0         // 正在加载的数量
		var maxPoolSize = apiCount   // 池子最大容量
		var currentIndex = 0         // 当前播放的图片索引
		var slideInterval = 6000     // 每张图播放时间(ms)
		var fadeTime = 800           // 淡入淡出时间(ms)
		
		// 从随机API获取一张图片并缓存
		function loadOneImage() {
			if (imagePool.length + loadingCount >= maxPoolSize) return
			
			loadingCount++
			// 每张图片随机选择一个API
			var randomApiIndex = Math.floor(Math.random() * apiUrls.length)
			var apiUrl = apiUrls[randomApiIndex]
			var timestamp = Date.now() + Math.random()
			var separator = apiUrl.indexOf('?') !== -1 ? '&' : '?'
			var imgUrl = apiUrl + separator + '_t=' + timestamp
			
			var img = new Image()
			img.onload = function() {
				// 图片加载成功，缓存真实URL
				imagePool.push(img.src)
				loadingCount--
				// 继续加载更多
				loadOneImage()
			}
			img.onerror = function() {
				loadingCount--
				// 加载失败，尝试其他API
				loadOneImage()
			}
			img.src = imgUrl
		}
		
		// 初始化：清空并创建2个轮播层（前景+背景）
		cdSlideShow.empty()
		var layer1 = $('<li class="slide-layer active"><span></span></li>')
		var layer2 = $('<li class="slide-layer"><span></span></li>')
		cdSlideShow.append(layer1).append(layer2)
		
		// 注入纯JS控制的CSS样式（模拟原来的淡入+放大效果）
		var styleId = 'dynamic-slideshow-style'
		$('#' + styleId).remove()
		var cssRules = [
			'.cb-slideshow .slide-layer span {',
			'  animation: none !important;',
			'  opacity: 0;',
			'  transform: scale(1);',
			'  transition: opacity ' + fadeTime + 'ms ease-in-out, transform ' + slideInterval + 'ms ease-out;',
			'  z-index: 0;',
			'}',
			'.cb-slideshow .slide-layer.active span {',
			'  opacity: 1;',
			'  transform: scale(1.08);',
			'  z-index: 1;',
			'}'
		]
		$('<style id="' + styleId + '">' + cssRules.join('\n') + '</style>').appendTo('head')
		
		var layers = cdSlideShow.find('.slide-layer')
		var activeLayerIndex = 0
		
		// 切换到下一张图片
		function nextSlide() {
			if (imagePool.length < 2) return  // 至少需要2张图
			
			// 计算下一张图片
			currentIndex = (currentIndex + 1) % imagePool.length
			
			// 获取当前和下一个图层
			var currentLayer = layers.eq(activeLayerIndex)
			var nextLayerIndex = (activeLayerIndex + 1) % 2
			var nextLayer = layers.eq(nextLayerIndex)
			
			// 设置下一图层的背景图
			nextLayer.find('span').css('backgroundImage', 'url(\'' + imagePool[currentIndex] + '\')')
			
			// 切换图层
			currentLayer.removeClass('active')
			nextLayer.addClass('active')
			activeLayerIndex = nextLayerIndex
			
			// 图片池管理：当播放过半且池满时，淘汰旧图补充新图
			if (imagePool.length >= maxPoolSize && currentIndex === Math.floor(maxPoolSize / 2)) {
				var removeCount = Math.floor(maxPoolSize / 4)
				imagePool.splice(0, removeCount)
				currentIndex = Math.max(0, currentIndex - removeCount)
				for (var i = 0; i < removeCount; i++) {
					loadOneImage()
				}
			}
		}
		
		// 启动预加载
		var initialLoadCount = Math.min(maxPoolSize, 10)
		for (var i = 0; i < initialLoadCount; i++) {
			loadOneImage()
		}
		
		// 等待初始图片加载完成后启动轮播
		var checkReady = setInterval(function() {
			if (imagePool.length >= 2) {
				clearInterval(checkReady)
				// 设置第一张图
				layers.eq(0).find('span').css('backgroundImage', 'url(\'' + imagePool[0] + '\')')
				layers.eq(0).addClass('active')
				// 启动轮播
				setInterval(nextSlide, slideInterval)
			}
		}, 500)
		
	} else {
		// 本地模式：从本地图片中随机选取
		var slideList = []
		var prefix = window.slideConfig.prefix
		var ext = '.' + window.slideConfig.ext
		var maxCount = window.slideConfig.maxCount
		for(var k = 0; k < 6; k++) {
			var n = Math.floor(Math.random() * maxCount) + 1
			while(slideList.indexOf(n) !== -1) {
				n = Math.floor(Math.random() * maxCount) + 1
			}
			slideList.push(n)
		}
		cdSlideShow.find('span').each(function (i, span) {
			$(this).css('backgroundImage', 'url(\'' + prefix + slideList[i] + ext + '\')')
		})
	}

	// ------- 处理背景图结束 -----------

	var panelToggle = $('.panel-toggle')
	var panelRemove = $('.panel-remove')
	panelToggle.on('click', function () {
		var that = $(this)
		var panelGal = that.parents('.panel-gal')
		if(that.hasClass('fa-chevron-circle-up')) {
			that.removeClass('fa-chevron-circle-up').addClass('fa-chevron-circle-down')
			panelGal.addClass('toggled')
		} else {
			that.removeClass('fa-chevron-circle-down').addClass('fa-chevron-circle-up')
			panelGal.removeClass('toggled')
		}
	})
	panelRemove.on('click', function () {
		var that = $(this)
		// TODO 不用jqueryUI
		that.parents('.panel').animate({
			opacity: 0
		}, 1000, function () {
			$(this).css('display', 'none')
			// $(this).css('opacity', 1)
		})
	})

	var tagsTab = $('#tags-tab')
	var friendLinksTab = $('#friend-links-tab')
	var linksTab = $('#links-tab')

	if (tagsTab) {
		tagsTab.tab('show')
	} else if (friendLinksTab) {
		friendLinksTab.tab('show')
	} else if (linksTab) {
		linksTab.tab('show')
	}


	if (tagsTab) {
		tagsTab.on('click', function (e) {
			e.preventDefault()
			$(this).tab('show')
		})
	}

	if (friendLinksTab) {
		friendLinksTab.on('click', function (e) {
			e.preventDefault()
			$(this).tab('show')
		})
	}

	if (linksTab) {
		linksTab.on('click', function (e) {
			e.preventDefault()
			$(this).tab('show')
		})
	}

	// ------- 处理返回顶端 -------------

	var goTop = $('#gal-gotop')
	goTop.css('bottom', '-40px')
	goTop.css('display', 'block')
	$(window).on('scroll', function () {
		if($(this).scrollTop() > 200) {
			goTop.css('bottom', '20px')
		} else {
			goTop.css('bottom', '-40px')
		}
	})
	goTop.on('click', function () {
		$('body,html').animate({
			scrollTop: 0
		}, 800)
	})

	// ------- 处理返回顶端结束 ----------
	
})($)

