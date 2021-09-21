		function OnShowResult(title,result)
		{
				layer.open({
				  type: 1 //Page层类型
				  ,skin: 'layui-layer-rim'
				  ,area: ['500px', 'auto']
				  ,title: title
				  ,shade: 0 //背景图透明度
				  ,maxmin: false //允许全屏最小化
				  ,anim: 1 //0-6的动画形式，-1不开启
				  ,content: '<div style="padding:30px;"><font size="2" color="blue">'+result+'</font></div>'
				});   
		}
		//GIS库外部变量接口定义
		var iconid=7;
		var icontype='.png';
		var linecolor='#0000FF';
	//	var fillcolor='rgba(0,255,0,0.4)';
		var fillcolor='rgba(255,0,0,0.4)';
		var linewidth=2;
		var linedash1=10;
		var linedash2=10;
		var linedash3=10;
		var featurename='未命名';
		//
		//点位数组定义
		var markmode=0;
		var clickmode=0;//点选模式
		var IsMeasure=0;
		var ptnum=0;
		var lastptnum=0;
		var ptarr =  new Array(10000);   //表格有10行
		for(var i = 0;i < ptarr.length; i++)
		{
			ptarr[i] = new Array(2);    //每行有10列
		}
		var ptmercator =  new Array(10000);   //表格有10行
		for(var i = 0;i < ptmercator.length; i++)
		{
			ptmercator[i] = new Array(2);    //每行有10列
		}
		var ptid =  new Array(10000);   //表格有10行
		var ptlayid =  new Array(10000);   //表格有10行
		var ptsym =  new Array(10000);   //表格有10行
		var pointsid=[];
		//多段线数组定义
		var plinenum=0;
		var lastplinenum=0;
		var plinearr =  new Array(500);   //表格有10行
		var plineid =  new Array(500);   //表格有10行
		var plinelayid =  new Array(500);   //表格有10行
		var plinecolor =  new Array(500);   //表格有10行
		var plineIsClosed =  new Array(500);   //表格有10行
		//多边形数组定义
		var lastpolygonpt=[];
		var polygonnum=0;
		var lastpolygonnum=0;
		var polygonarr =  new Array(500);   //表格有10行
		var polygonid =  new Array(500);   //表格有10行
		var polygonlayid =  new Array(500);   //表格有10行
		var polygonlinecolor =  new Array(500);   //表格有10行
		var polygonfillcolor =  new Array(500);   //表格有10行
		//其他图形数组定义
		var polynum=0;
		var lastpolynum=0;
		var polytype =  new Array(500);   //表格有10行
		var polyarr =  new Array(500);   //表格有10行
		var polyid =  new Array(500);   //表格有10行
		var polylayid =  new Array(500);   //表格有10行
		var polylinecolor =  new Array(500);   //表格有10行
		var polyfillcolor =  new Array(500);   //表格有10行
		//拉窗或画圆控制点坐标定义
		var x1=0;
		var x2=0;
		var y1=0;
		var y2=0;
		//路径规划变量
        var result = 0;
        var start;
        var end;
        var laststart;
        var lastend;
		var id=1;
		var x1, y1, x2, y2;
   //     var name;
		//
		var maptype=1;
		var plotDraw, plotEdit;
		var g_op_feature = null;
		var operationmode=0;
		var selectmode=0;//设备查询开关
		var	keyname="";
		var	keyvalue="";
		var map;
		var measuretype='Polygon';
        //实例化比例尺控件（ScaleLine）
        var scaleLineControl = new ol.control.ScaleLine({
            units: "metric" //设置比例尺单位，degrees、imperial、us、nautical、metric（度量单位）
        });
		
        //实例化鼠标位置控件（MousePosition）
        var mousePositionControl = new ol.control.MousePosition({
            coordinateFormat: ol.coordinate.createStringXY(7), //坐标格式
            projection: 'EPSG:4326',//地图投影坐标系（若未设置则输出为默认投影坐标系下的坐标）
            className: 'custom-mouse-position', //坐标信息显示样式，默认是'ol-mouse-position'
            target: document.getElementById('mouse-position'), //显示鼠标位置信息的目标容器
            undefinedHTML: '&nbsp;'//未定义坐标的标记
        });
		// 地图设置中心，设置到成都，在本地离线地图 offlineMapTiles刚好有一张zoom为4的成都瓦片
//		var center = ol.proj.transform([113.550832, 22.237527], 'EPSG:4326', 'EPSG:3857');
		var center = ol.proj.transform([118.153637, 31.149301], 'EPSG:4326', 'EPSG:3857');

        //实例化鹰眼控件（OverviewMap）,自定义样式的鹰眼控件  
        var overviewMapControl = new ol.control.OverviewMap({
            className: 'ol-overviewmap ol-custom-overviewmap', //鹰眼控件样式（see in overviewmap-custom.html to see the custom CSS used）
            //鹰眼中加载同坐标系下不同数据源的图层,可叠加合并两个瓦片图层
            layers: [ 
                new ol.layer.Tile({
					source: new ol.source.XYZ({
				//		url: '120.76.219.3/zhuhai/map/{z}/{x},{y}.png'
				//		url: 'http://mt0.google.cn/vt/lyrs=m@158000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=G'
						url: 'http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
					})
                })
            ],
            collapseLabel: '\u00BB', //鹰眼控件展开时功能按钮上的标识（网页的JS的字符编码）
            label: '\u00AB', //鹰眼控件折叠时功能按钮上的标识（网页的JS的字符编码）
            collapsed: true //初始为展开显示方式
        });

		// 添加一个使用离线瓦片地图的层
		var MapLayer = new ol.layer.Tile({
			source: new ol.source.XYZ({
	//			url: '120.76.219.3/zhuhai/map/{z}/{x},{y}.png'
	//			url: 'http://mt0.google.cn/vt/lyrs=m@158000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=G'
				url: 'http://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}'
		//		url: 'http://localhost/whmap/map/{z}/{x}/{x},{y}.png'
			})
		});
		var ImgMapLayer = new ol.layer.Tile({
			source: new ol.source.XYZ({
			//	url: 'http://120.76.219.3/wuhu/imgmap/{z}/{x}/{x},{y}.jpg'
		//		url: 'http://www.google.cn/maps/vt?lyrs=s@183&gl=cn&x={x}&y={y}&z={z}'
				url: 'http://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}'
			})
		});
		var ImgVctLayer = new ol.layer.Tile({
			source: new ol.source.XYZ({
	//			url: '../zhuhai/vctmap/{z}/{x}/{x},{y}.jpg'
	//			url: 'http://mt0.google.cn/vt/imgtp=png32&lyrs=h@158000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=G'
				url: 'http://webst04.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8'
			})
		});

		var source = new ol.source.Vector({ 
			wrapX: false 
			});
		var vectordraw = new ol.layer.Vector({
			source: source,
			style: new ol.style.Style({
				fill: new ol.style.Fill({
					color: 'rgba(255, 0, 0, 0.25)'
				}),
				stroke: new ol.style.Stroke({
					color: '#ff0000',
					width: 2
				}),
				image: new ol.style.Circle({
					radius: 7,
					fill: new ol.style.Fill({
						color: '#ff0000'
					})
				})
			})
		});
		var blur = document.getElementById('blur');
		var radius = document.getElementById('radius');
		var heatmapAdded=0;
		var vector = new ol.layer.Heatmap({
		  source: new ol.source.Vector({
			url: 'data/kml/2021_WuhuPGIS.kml',
			format: new ol.format.KML({
			  extractStyles: false,
			}),
		  }),
		  blur: parseInt(blur.value, 0.5),
		  radius: parseInt(radius.value, 0.5),
		  weight: function (feature) {
			// 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
			// standards-violating <magnitude> tag in each Placemark.  We extract it from
			// the Placemark's name instead.
			var name = feature.get('name');
			var magnitude = parseFloat(name.substr(2));
			return magnitude - 0.0;
		  },
		});
		//创建地图
		var map = new ol.Map({
			layers: [MapLayer,vectordraw],
			target: 'map',
			view: new ol.View({ 
				center: center,
			//	center: [113.55,22.237],
            //  projection: 'EPSG:4326',
				zoom: 10
			}),
            //加载瓦片时开启动画效果
            loadTilesWhileAnimating: true, 
		});


		var blurHandler = function () {
		  vector.setBlur(parseInt(blur.value, 10));
		};
		blur.addEventListener('input', blurHandler);
		blur.addEventListener('change', blurHandler);

		var radiusHandler = function () {
		  vector.setRadius(parseInt(radius.value, 10));
		};
		radius.addEventListener('input', radiusHandler);
		radius.addEventListener('change', radiusHandler);

        map.addControl(scaleLineControl); 
        map.addControl(mousePositionControl); 
        map.addControl(overviewMapControl); 

		map.getView().on('change:resolution',checkZoom);//checkZoom为调用的函数
		function checkZoom() {
			console.log(map.getView().getZoom());
			if (map.getView().getZoom() > 18) 
			{
				var view=map.getView();
				view.setZoom(18);
			}
		}

//以下为路径导航代码，

        //矢量图层数据源
        var sourceVector = new ol.source.Vector();
        //矢量图层
        var vectorplan = new ol.layer.Vector({
            source: sourceVector,
            style: function (feature) {
                var status = feature.get("status");              
                var _color = "#8f8f8f";
                if (status === "拥堵") _color = "#e20000";
                else if (status === "缓行") _color = "#ff7324";
                else if (status === "畅通") _color = "#00b514";

                return new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: _color,
                        width: 5,
                        lineDash:[10, 8]
                    }),
                })
            }
        });
        map.addLayer(vectorplan);
		
//        map.addLayer(vectordraw);
        //菜单栏点击事件
        $("#start").click(function () {
            result = 1;
        });
        $("#end").click(function () {
            result = 2;
        });
        $("#clear").click(function () {
            result = 0;
            start = "";
            end = "";
        //    name = '';
            sourceVector.clear();
        });
        //地图点击事件
        map.on("click", function (evt) 
		{
            //获取坐标
            var coordate = evt.coordinate;
			if(markmode==1)
			{
				var markpoint = GetCoordate(coordate);
				//麦卡托转经纬度
				var str2=''+markpoint;
				var arr2=str2.split(",");
				var markpoint84 = ol.proj.transform([arr2[0],arr2[1]], 'EPSG:3857', 'EPSG:4326');
				markpoint84=markpoint84+'';
				OnShowResult("标注点坐标：",markpoint84);

				iconid=7;
				icontype='.png';
				var arr=[[105,25.0]];
				var str=''+markpoint;
				var arr0=str.split(",");
				arr[0][0]=parseFloat(arr0[0]);
				arr[0][1]=parseFloat(arr0[1]);
				g_pol_layer.plotDraw.drawingfinish('marker',arr);// 多边形

			}
			if(clickmode==1)
			{
			//	var zoom=map.getView().getZoom();
				var meterperpixel = map.getView().getResolution();   
				minx=coordate[0]-16.0*meterperpixel;//Math.pow(2,18-zoom);			
				miny=coordate[1]-16.0*meterperpixel;//Math.pow(2,18-zoom);
				maxx=coordate[0]+16.0*meterperpixel;//Math.pow(2,18-zoom);			
				maxy=coordate[1]+16.0*meterperpixel;//Math.pow(2,18-zoom);
				var Points=[];
				var PointsID=[];
				var coordinate=new Array(2);
				var clickresult="";
				var count=0;
				for(i=0;i<ptnum;i++)
				{
					if(ptmercator[i][0] > minx && ptmercator[i][0] < maxx && ptmercator[i][1] > miny && ptmercator[i][1] < maxy)
					{
						PointsID.push(ptlayid[i]+'_'+ptid[i]);
						clickresult=clickresult+ptlayid[i]+'_'+ptid[i]+'|';
						count=count+1;
					}
				}
			//	if(count>0) OnShowResult("设备点选结果：",count+':'+clickresult);
			//	if(count>0) OnShowResult("设备点选结果：",clickresult);
				if(count>0) GetSelectedObjects(clickresult)
			}
			if(selectmode==2)
			{
				if(x1==0 && y1==0)
				{
					x1=coordate[0];
					y1=coordate[1];
				}
				else if(x2==0 && y2==0)
				{
					x2=coordate[0];
					y2=coordate[1];
				}
				if(x1>0 && y1>0 && x2>0 && y2>0)
				{
					var radius=Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
					minx=x1-radius;	
					miny=y1-radius;
					maxx=x1+radius;
					maxy=y1+radius;
					var coordinate=new Array(2);
					var clickresult="";
					var count=0;
					var radiusi=0;
					for(i=0;i<ptnum;i++)
					{
						if(ptmercator[i][0] > minx && ptmercator[i][0] < maxx && ptmercator[i][1] > miny && ptmercator[i][1] < maxy)
						{
							radiusi=Math.sqrt((x1-ptmercator[i][0])*(x1-ptmercator[i][0])+(y1-ptmercator[i][1])*(y1-ptmercator[i][1]));
							if(radiusi <= radius)
							{
								clickresult=clickresult+ptlayid[i]+'_'+ptid[i]+'|';
								count=count+1;
							}
						}
					}
			//		if(count>0) OnShowResult("设备画圆结果：",count+':'+clickresult);
			//		if(count>0) OnShowResult("设备画圆结果：",clickresult);
					if(count>0) GetSelectedObjects(clickresult)
					x1=0;
					x2=0;
					y1=0;
					y2=0;
					selectmode=0;
					map.removeInteraction(draw);
				}
			}
			else if(selectmode==3)
			{
				if(x1==0 && y1==0)
				{
					x1=coordate[0];
					y1=coordate[1];
				}
				else if(x2==0 && y2==0)
				{
					x2=coordate[0];
					y2=coordate[1];
				}
				if(x1>0 && y1>0 && x2>0 && y2>0)
				{
					var radius=Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
					minx=Math.min(x1,x2);	
					miny=Math.min(y1,y2);
					maxx=Math.max(x1,x2);
					maxy=Math.max(y1,y2);
					var coordinate=new Array(2);
					var clickresult="";
					var count=0;
					var radiusi=0;
					for(i=0;i<ptnum;i++)
					{
						if(ptmercator[i][0] > minx && ptmercator[i][0] < maxx && ptmercator[i][1] > miny && ptmercator[i][1] < maxy)
						{
								clickresult=clickresult+ptlayid[i]+'_'+ptid[i]+'|';
								count=count+1;
						}
					}
			//		if(count>0) OnShowResult("设备拉窗结果：",count+':'+clickresult);
			//		if(count>0) OnShowResult("设备拉窗结果：",clickresult);
					if(count>0) GetSelectedObjects(clickresult)
					x1=0;
					x2=0;
					y1=0;
					y2=0;
					selectmode=0;
					map.removeInteraction(draw);
				}
			}
			else if(selectmode==4)
			{
				lastpolygonpt.push(coordate);
			}
       //     console.log(evt.coordinate);
       //     console.log(coordate);
            //如果result为0，返回不做任何操作
            if (result == 0) {
                return;
            }
            else 
			{
				if (result == 1) {
					//起点
					//构造提交api起点坐标
					start = GetCoordate(coordate);
			//		console.log("起点" + start);
			//		name = '起点'; //去掉本行后地图标绘功能恢复正常，否则进行路径规划后地图标绘功能不可用，原因不明。  2021.06。10
					//矢量元素
					var featureStart = new ol.Feature({
						geometry: new ol.geom.Point(coordate),
						name: '起点',//自定义属性

					});
					featureStart.setStyle(createFeatureStyle(featureStart,'起点'));
					sourceVector.addFeature(featureStart);
				}
				else 
				{
					//终点
					//构造提交api终点坐标
				//	name = '终点';  //去掉本行后地图标绘功能恢复正常，否则进行路径规划后地图标绘功能不可用，原因不明。  2021.06。10
					end = GetCoordate(coordate);
				//	console.log("终点" + end);
					//矢量元素
					var featureEnd = new ol.Feature({
						geometry: new ol.geom.Point(coordate),
						name: '终点',//自定义属性

					});
					featureEnd.setStyle(createFeatureStyle(featureEnd,'终点'));
					sourceVector.addFeature(featureEnd);
					//麦卡托转经纬度
				/*	var str=''+start;
					var arr=str.split(",");
					var start84 = ol.proj.transform([arr[0],arr[1]], 'EPSG:3857', 'EPSG:4326');
					start=start84+'';
					var str1=''+end;
					var arr1=str1.split(",");
					var end84 = ol.proj.transform([arr1[0],arr1[1]], 'EPSG:3857', 'EPSG:4326');
					end=end84+'';		*/		
				   // 请求数据
			//		getRouteResult(start, end);  
					laststart=start;
					lastend=end;
		//			alert(laststart+'_'+lastend);
				//	SendRoutePlanInfo(start, end);
				//	setTimeout('ReSendRoutePlanInfo()',500);
				}
            }
        });

        function PlanMarker(startx,starty, endx, endy) 
		{
					var startcoordinate = ol.proj.transform([startx, starty], 'EPSG:4326', 'EPSG:3857');//经纬度转麦卡托
					var endcoordinate = ol.proj.transform([endx, endy], 'EPSG:4326', 'EPSG:3857');//经纬度转麦卡托

			//		console.log("起点" + start);
			//		name = '起点'; //去掉本行后地图标绘功能恢复正常，否则进行路径规划后地图标绘功能不可用，原因不明。  2021.06。10
					//矢量元素
					var featureStart = new ol.Feature({
						geometry: new ol.geom.Point(startcoordinate),
						name: '起点',//自定义属性

					});
					featureStart.setStyle(createFeatureStyle(featureStart,'起点'));
					sourceVector.addFeature(featureStart);

				//	console.log("终点" + end);
					//矢量元素
					var featureEnd = new ol.Feature({
						geometry: new ol.geom.Point(endcoordinate),
						name: '终点',//自定义属性

					});
					featureEnd.setStyle(createFeatureStyle(featureEnd,'终点'));
					sourceVector.addFeature(featureEnd);
		}

        //获取路径规划
        function SendRoutePlanInfo(start, end) {
					//麦卡托转经纬度
					var str=''+start;
					var arr=str.split(",");
					var start84 = ol.proj.transform([arr[0],arr[1]], 'EPSG:3857', 'EPSG:4326');
					start=start84+'';
					var str1=''+end;
					var arr1=str1.split(",");
					var end84 = ol.proj.transform([arr1[0],arr1[1]], 'EPSG:3857', 'EPSG:4326');
					end=end84+'';
					var startstr=start.split(",");
					var endstr=end.split(",");
					//id, x1, y1, x2, y2为全局变量
					id=1;
					x1=startstr[0];
					y1=startstr[1];
					x2=endstr[0];
					y2=endstr[1];
					//
					window.open("http://localhost/whWebGIS/SendPlanPoint.php?ID=1"+"&X1="+startstr[0]+"&Y1="+startstr[1]+"&X2="+endstr[0]+"&Y2="+endstr[1],"Info");
				//	setTimeout('SearchRouteResult(1,startstr[0],startstr[1],endstr[0],endstr[1])',1000);
				//	setTimeout('SearchRouteResult()',1500);
		}

        //获取路径规划
        function ReSendRoutePlanInfo() {
					//
					window.open("http://localhost/whWebGIS/SendPlanPoint.php?ID="+id+"&X1="+x1+"&Y1="+y1+"&X2="+x2+"&Y2="+y2,"Info");
				//	setTimeout('SearchRouteResult(1,startstr[0],startstr[1],endstr[0],endstr[1])',1000);
				//	setTimeout('SearchRouteResult()',1500);
		}

        //获取路径规划
        function DrawRouteResultTest() 
		{
			var polylineStr='113.565946,22.247279;113.565938,22.247235;113.565938,22.247179;113.565955,22.247088;113.565955,22.247088;113.565955,22.24707;113.566237,22.246345;113.566237,22.246345;113.566367,22.246016;113.566367,22.246016;113.56681,22.244865;113.56681,22.244865;113.566845,22.244727;113.566862,22.244701;113.566862,22.244701;113.567066,22.244275;113.567066,22.244275;113.567105,22.244184_113.567105,22.24418;113.567144,22.244062;113.567144,22.244032;113.567131,22.243984;113.567118,22.243958;113.567118,22.243958;113.567313,22.243872;113.567313,22.243872;113.567344,22.243702_113.567344,22.243698;113.56727,22.243555_113.567266,22.24355;113.567209,22.243563;113.567148,22.243559;113.566988,22.24352;113.566714,22.243481_113.56671,22.243477;113.566463,22.243407;113.566463,22.243407;113.565707,22.243151;113.565707,22.243151;113.565126,22.242951;113.565126,22.242951;113.564219,22.242639_113.564214,22.242635;113.564188,22.24253;113.564188,22.24247;113.564214,22.242348;113.564214,22.242348;113.564384,22.24197;113.564384,22.24197;113.564488,22.241719;113.564488,22.241719;113.564757,22.24112_113.564757,22.241115;113.564614,22.24105;113.563828,22.240612;113.563828,22.240612;113.563464,22.240395;113.563464,22.240395;113.562187,22.239653;113.562187,22.239653;113.561632,22.239336;113.561389,22.239188;113.561389,22.239188;113.56115,22.239054;113.56115,22.239054;113.560391,22.23862;113.560391,22.23862;113.560143,22.23849;113.560143,22.23849;113.559787,22.2382818451;113.572535,22.238451;113.572457,22.238247;113.572457,22.238247;113.572361,22.238003;113.572214,22.237595;113.572101,22.237214;113.571849,22.236228;113.571849,22.236228;113.571832,22.236181;113.571832,22.236181;113.571628,22.235317;113.571628,22.235317;113.57148,22.234687;113.57148,22.234687;113.571428,22.234453;113.571428,22.234453;113.571259,22.233776;113.571259,22.233776;113.571207,22.233537;113.571207,22.233537;113.571163,22.233398;113.571163,22.233398;113.571046,22.232886;113.571046,22.232886;113.571003,22.232691;113.570864,22.232461';
			var polylines=polylineStr.split("_");

				for (var k = 0; k < polylines.length; k++) {
				//	alert(polylines.length+'-'+polylines[k]);
					var polyline = polylines[k].split(";");
					var status = '畅通';
					var polylineData = [];
					for (var j = 0; j < polyline.length; j++) {
					//	alert(polyline);
						//将字符串拆成数组
						var realData = polyline[j].split(",");
						var coordinate = ol.proj.transform([realData[0], realData[1]], 'EPSG:4326', 'EPSG:3857');//经纬度转麦卡托
						polylineData.push(coordinate);
						//要素属性
					}
					//线此处注意一定要是坐标数组
					var pline = new ol.geom.LineString(polylineData);
					//线要素类
					var feature = new ol.Feature({
						geometry: pline,
						status: status
					});
					sourceVector.addFeature(feature);                         
				}
        };

        function DrawCarResult() 
		{
					//麦卡托转经纬度
					var str=''+laststart;
					var arr=str.split(",");
					var start84 = ol.proj.transform([arr[0],arr[1]], 'EPSG:3857', 'EPSG:4326');
					start=start84+'';
					var str1=''+lastend;
					var arr1=str1.split(",");
					var end84 = ol.proj.transform([arr1[0],arr1[1]], 'EPSG:3857', 'EPSG:4326');
					end=end84+'';
            var data = {
                key: "d85a216e1f209606bd95cdb1c5a4a72d",//申请的key值
                origin: start,//起点
                destination: end,//终点
                extensions:"all"
            };
            $.ajax({
                url: "https://restapi.amap.com/v3/direction/driving?",  // v3 ～v5
                type: "post",
                dataType: "jsonp",
                data: data,
                success: function (result) {
                //    console.log(result);
                    var routes = result["route"]["paths"][0];
               //     console.log(routes);
                    //console.log(routes);
                    var steps = routes["steps"];
                    //console.log(steps);
                    for (var i = 0; i < steps.length; i++) {                       
                        var route = steps[i];
                        var path = route["tmcs"];
                        for (var k = 0; k < path.length; k++) {
                            var routePath = path[k];                           
                       //     var distance = routePath["distance"];
                            var polyline = routePath["polyline"].toString().split(";");
                            var status = routePath["status"];
                            var polylineData = [];
                            for (var j = 0; j < polyline.length; j++) {
                                //将字符串拆成数组
                                var realData = polyline[j].split(",");
                            //  var coordinate = [realData[0], realData[1]];
								var coordinate = ol.proj.transform([realData[0], realData[1]], 'EPSG:4326', 'EPSG:3857');//经纬度转麦卡托
                                polylineData.push(coordinate);
                                //要素属性
                            }
                     //       var attribute = {
                     //           distance: distance,
                     //       };
                            //线此处注意一定要是坐标数组
                            var plygon = new ol.geom.LineString(polylineData);
                            //线要素类
                            var feature = new ol.Feature({
                                geometry: plygon,
                        //        attr: attribute,
                                status: status
                            });
                            sourceVector.addFeature(feature);                         
                        }
                    }
                }
            });
        };

        function DrawWalkResult() 
		{
					//麦卡托转经纬度
					var str=''+start;
					var arr=str.split(",");
					var start84 = ol.proj.transform([arr[0],arr[1]], 'EPSG:3857', 'EPSG:4326');
					start=start84+'';
					var str1=''+end;
					var arr1=str1.split(",");
					var end84 = ol.proj.transform([arr1[0],arr1[1]], 'EPSG:3857', 'EPSG:4326');
					end=end84+'';
            var data = {
                key: "18af7c5bc6247d95593b17838f2e7509",//申请的key值
                origin: start,//起点
                destination: end,//终点
                extensions:"all"
            };

            $.ajax({
                url: "https://restapi.amap.com/v3/direction/walking?",  // v3 ～v5
                type: "post",
                dataType: "jsonp",
                data: data,
                success: function (result) {
                    var routes = result["route"]["paths"][0];
                    var steps = routes["steps"];
                    for (var i = 0; i < steps.length; i++) {                       
                        var route = steps[i];
                            var polyline = route["polyline"].toString().split(";");
                            var status = '畅通';
                            var polylineData = [];
                            for (var j = 0; j < polyline.length; j++) {
                                //将字符串拆成数组
                                var realData = polyline[j].split(",");
                            //  var coordinate = [realData[0], realData[1]];
								var coordinate = ol.proj.transform([realData[0], realData[1]], 'EPSG:4326', 'EPSG:3857');//经纬度转麦卡托
                                polylineData.push(coordinate);
                                //要素属性
                            }
                     //       var attribute = {
                     //           distance: distance,
                     //       };
                            //线此处注意一定要是坐标数组
                            var plygon = new ol.geom.LineString(polylineData);
                            //线要素类
                            var feature = new ol.Feature({
                                geometry: plygon,
                        //        attr: attribute,
                                status: status
                            });
                            sourceVector.addFeature(feature);                         
                    }
                }
            });
        };

        //获取路径规划
        function DrawRouteResult(statusStr, polylineStr) 
		{
			var polylines=polylineStr.split("_");

				for (var k = 0; k < polylines.length; k++) {
				//	alert(polylines.length+'-'+polylines[k]);
					var polyline = polylines[k].split(";");
					var status = '畅通';
					var polylineData = [];
					if(polyline.length > 1){
						for (var j = 0; j < polyline.length; j++) {
						//	alert(polyline);
							//将字符串拆成数组
							var realData = polyline[j].split(",");
							var coordinate = ol.proj.transform([realData[0], realData[1]], 'EPSG:4326', 'EPSG:3857');//经纬度转麦卡托
							polylineData.push(coordinate);
							//要素属性
						}
						//线此处注意一定要是坐标数组
						var pline = new ol.geom.LineString(polylineData);
						//线要素类
						var feature = new ol.Feature({
							geometry: pline,
							status: status
						});
						sourceVector.addFeature(feature);  
					}
				}
        };

        //获取路径规划
        function SearchRouteResult()//id, x1, y1, x2, y2为全局变量
		{
		//	alert('SearchRouteResult');
				//	window.open("http://localhost/whWebGIS/SearchPlanResult.php?ID="+id+"&X1="+x1+"&Y1="+y1+"&X2="+x2+"&Y2="+y2,"Info");			
					window.open("SearchPlanResult.jsp","Info");			
			//		window.open("SearchPlanResult.php?ID=1","Info");		
		}

		//获取路径规划
        function getRouteResult(start, end) {
					//麦卡托转经纬度
					var str=''+start;
					var arr=str.split(",");
					var start84 = ol.proj.transform([arr[0],arr[1]], 'EPSG:3857', 'EPSG:4326');
					start=start84+'';
					var str1=''+end;
					var arr1=str1.split(",");
					var end84 = ol.proj.transform([arr1[0],arr1[1]], 'EPSG:3857', 'EPSG:4326');
					end=end84+'';
				//	alert(start);
				//	alert(end);
            var data = {
                key: "d85a216e1f209606bd95cdb1c5a4a72d",//申请的key值
                origin: start,//起点
                destination: end,//终点
                extensions:"all"
            };
            $.ajax({
                url: "https://restapi.amap.com/v3/direction/driving?",  // v3 ～v5
                type: "post",
                dataType: "jsonp",
                data: data,
                success: function (result) {
                //    console.log(result);
                    var routes = result["route"]["paths"][0];
               //     console.log(routes);
                    //console.log(routes);
                    var steps = routes["steps"];
                    //console.log(steps);
                    for (var i = 0; i < steps.length; i++) {                       
                        var route = steps[i];
                        var path = route["tmcs"];
                        for (var k = 0; k < path.length; k++) {
                            var routePath = path[k];                           
                       //     var distance = routePath["distance"];
                            var polyline = routePath["polyline"].toString().split(";");
                            var status = routePath["status"];
                            var polylineData = [];
                            for (var j = 0; j < polyline.length; j++) {
                                //将字符串拆成数组
                                var realData = polyline[j].split(",");
                            //  var coordinate = [realData[0], realData[1]];
								var coordinate = ol.proj.transform([realData[0], realData[1]], 'EPSG:4326', 'EPSG:3857');//经纬度转麦卡托
                                polylineData.push(coordinate);
                                //要素属性
                            }
                     //       var attribute = {
                     //           distance: distance,
                     //       };
                            //线此处注意一定要是坐标数组
                            var plygon = new ol.geom.LineString(polylineData);
                            //线要素类
                            var feature = new ol.Feature({
                                geometry: plygon,
                        //        attr: attribute,
                                status: status
                            });
                            sourceVector.addFeature(feature);                         
                        }
                    }
                }
            });
        };
        //保存小数点后六位
        function GetCoordate(coordate) {
            var lng = coordate[0].toString();
            var lat = coordate[1].toString();
            var lngIndex = lng.indexOf(".") + 7;
            var latIndex = lat.indexOf(".") + 7;
            lng = lng.substring(0, lngIndex);
            lat = lat.substring(0, latIndex);
            var str = lng + "," + lat;
        //    console.log(str.toString());
            return str;
        }
        //样式函数
        var createFeatureStyle = function (feature, name) {
            var url;
            if (name==null) {
                url = "image/marker1.png";
            }
            else {
                if (name=="起点") {
                    url = "image/marker1.png";
                }
                else {
                    url = "image/marker2.png";
                }
            }
            return new ol.style.Style({
                image: new ol.style.Icon(({
                    anchor: [0.5, 32],
                    anchorOrigin: 'top-right',
                    anchorXUnits: 'fraction',
                    anchorYUnits: 'pixels',
                    offsetOrigin: 'top-right',
                    offset: [0, 0],//偏移量设置
                    scale: 1,  //图标缩放比例
                    opacity: 0.75,  //透明度
                    src: url, //图标的url
                    
                })),
            });

        }
//以上为路径导航代码
		//
		window.g_pol_layer = new POL.PlottingLayer(map);

		g_pol_layer.on(POL.FeatureOperatorEvent.ACTIVATE, function (e) {
			window.g_op_feature = e.feature_operator;
			document.getElementById('style-input').value = JSON.stringify(g_op_feature.getStyle());
			keyname="";
			keyvalue="";
			g_op_feature.iteratorAttribute(function (key) {
				$('#property-show').append('<span>' + key + ' :</span><input value = ' + this.getAttribute(key) + '></input><br>')
				keyname=key;
				keyvalue=this.getAttribute(key);
			}, g_op_feature)

		 //   activeDelBtn();
		})
		g_pol_layer.on(POL.FeatureOperatorEvent.DEACTIVATE, function (e) {
			window.g_op_feature =null;
	   //     deactiveDelBtn();
			document.getElementById('style-input').value = ""
			$('#property-show').empty();
		})

		/*地图请求工具类*/
		var query = {
			//判断点是否在多边形范围内
			queryPointsInPolygon: function (points, polygon) {
				var inPolygonPoints=[];
				for (var i = 0; i < points.length; i++) {
					if (queryPtInPolygon(points[i], polygon))
					{
						inPolygonPoints.push(points[i]);
					}
				}
				return inPolygonPoints; //返回坐标

				//判断点是否在多边形范围内
				function queryPtInPolygon(point, polygon) {
					var p1, p2, p3, p4;

					p1 = point;
					p2 = { x: -100, y: point.y };

					var count = 0;
					//对每条边都和射线作对比
					for (var i = 0; i < polygon.length - 1; i++) {
						p3 = polygon[i];

						p4 = polygon[i + 1];
						if (checkCross(p1, p2, p3, p4) == true) {
							count++;
						}
					}
					p3 = polygon[polygon.length - 1];

					p4 = polygon[0];
					if (checkCross(p1, p2, p3, p4) == true) {
						count++;
					}

					return (count % 2 == 0) ? false : true;

					//判断两条线段是否相交
					function checkCross(p1, p2, p3, p4) {
						var v1 = { x: p1.x - p3.x, y: p1.y - p3.y },
						v2 = { x: p2.x - p3.x, y: p2.y - p3.y },

						v3 = { x: p4.x - p3.x, y: p4.y - p3.y },
						v = crossMul(v1, v3) * crossMul(v2, v3);

						v1 = { x: p3.x - p1.x, y: p3.y - p1.y };
						v2 = { x: p4.x - p1.x, y: p4.y - p1.y };

						v3 = { x: p2.x - p1.x, y: p2.y - p1.y };
						return (v <= 0 && crossMul(v1, v3) * crossMul(v2, v3) <= 0) ? true : false;

					}

					//计算向量叉乘
					function crossMul(v1, v2) {
						return v1.x * v2.y - v1.y * v2.x;
					}
				}
			}
		};
		/**
		 * Currently drawn feature.
		 * @type {import("../src/ol/Feature.js").default}
		 */
		var sketch;
		var measuretype='Polygon';

		/**
		 * The help tooltip element.
		 * @type {HTMLElement}
		 */
		var helpTooltipElement;

		/**
		 * Overlay to show the help messages.
		 * @type {Overlay}
		 */
		var helpTooltip;

		/**
		 * The measure tooltip element.
		 * @type {HTMLElement}
		 */
		var measureTooltipElement;

		/**
		 * Overlay to show the measurement.
		 * @type {Overlay}
		 */
		var measureTooltip;

		/**
		 * Message to show when the user is drawing a polygon.
		 * @type {string}
		 */
		var continuePolygonMsg = '点击左键继续绘制面积测量多边形，可双击结束';

		/**
		 * Message to show when the user is drawing a line.
		 * @type {string}
		 */
		var continueLineMsg = '点击左键继续绘制测量多段线，可双击结束';

		/**
		 * Handle pointer move.
		 * @param {import("../src/ol/MapBrowserEvent").default} evt The event.
		 */
		var pointerMoveHandler = function (evt) {
		  if(IsMeasure==0) return;
		  if (evt.dragging) {
			return;
		  }
		  /** @type {string} */
		  var helpMsg = '';

		  if (sketch) {
			var geom = sketch.getGeometry();
			if (geom instanceof ol.geom.Polygon) {
			  helpMsg = continuePolygonMsg;
			} else if (geom instanceof ol.geom.LineString) {
			  helpMsg = continueLineMsg;
			}
		  }

		  helpTooltipElement.innerHTML = helpMsg;
		  helpTooltip.setPosition(evt.coordinate);

		  helpTooltipElement.classList.remove('hidden');
		};


		map.on('pointermove', pointerMoveHandler);

		map.getViewport().addEventListener('mouseout', function () {
		  helpTooltipElement.classList.add('hidden');
		});

		map.getViewport().addEventListener('pointerup', function (e) {
//			alert(e.clientX+','+e.clientY+'|'+e.pageX+','+e.pageY+'|'+e.screenX+','+e.screenY);
	//		var points = g_pol_layer.plotEdit.activePlot.getGeometry().getPoints();
		});

 		map.getViewport().addEventListener('dblclick', function (e) {
			if(operationmode==1)//双击选择删图元
			{
				g_pol_layer.removeFeature(window.g_op_feature);
				g_op_feature = null;
			}
			else if(operationmode==2)//双击查图元ID
			{
				if (g_op_feature) OnShowResult("图元ID查询结果",e.clientX+'_'+e.clientY+'|'+g_op_feature.getName());
			}
			else if(operationmode==3)//双击查图元坐标
			{
				if (g_op_feature)
				{
					var points = g_pol_layer.plotEdit.activePlot.getGeometry().getPoints();
					var plarr=(points+'').split(",");
					plptnum=plarr.length/2;
					var plptarr =  new Array(plptnum);   //表格有10行
					for(var i = 0;i < plptarr.length; i++)
					{
						plptarr[i] = new Array(2);    //每行有10列
					}

					for (i=0;i<2*plptnum-1;i=i+2) 
					{
						plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
						plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
					}
					var pti84;
					for(i=0;i<plptnum;i++)
					{
				//		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
						pti84=ol.proj.transform([plptarr[i][0],plptarr[i][1]], 'EPSG:3857', 'EPSG:4326');
					//		ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
						plptarr[i][0]=pti84[0];
						plptarr[i][1]=pti84[1];
					}
					OnShowResult("坐标查询结果",g_op_feature.getName()+"|"+plptnum+"_"+plptarr);
				}
			}
			else if(operationmode==4)//双击查图元属性
			{
				if (g_op_feature)
				{
					if(keyvalue=="") OnShowResult("属性查询结果",JSON.stringify(g_op_feature.getStyle())+"|"+g_op_feature.getName());
					else 
					OnShowResult("属性查询结果",keyname+":"+keyvalue+"|"+JSON.stringify(g_op_feature.getStyle())+"|"+g_op_feature.getName());
				}
			}
			if(selectmode==4)//多边形查询结束
			{
			//	if (g_op_feature) lastpolygonpt = g_pol_layer.plotEdit.activePlot.getGeometry().getPoints();
			//	OnShowResult("坐标查询结果",lastpolygonpt.length+':'+lastpolygonpt);
				pgarr=(lastpolygonpt+'').split(","); //字符分割 
			//	alert(pgarr[0]+',');
				var pgptnum=pgarr.length/2;
				var polygon=new Array(pgptnum);
				for(i=0;i<pgptnum;i++)
				{
					polygon[i]=new Array(2);
				}
				minx=99999999.0;  miny=9999999.0;
				maxx=0;			  maxy=0;
				for (i=0;i<2*pgptnum-1;i=i+2) 
				{
				//	polygon[i/2].x=Number(pgarr[i]);//转为数字，否则出错
				//	polygon[i/2].y=Number(pgarr[i+1]);//转为数字，否则出错
					polygon[i/2].x=pgarr[i];//转为数字，否则出错
					polygon[i/2].y=pgarr[i+1];//转为数字，否则出错
					maxx=Math.max(maxx,Number(pgarr[i]));
					maxy=Math.max(maxy,Number(pgarr[i+1]));
					minx=Math.min(minx,Number(pgarr[i]));
					miny=Math.min(miny,Number(pgarr[i+1]));
				}
				var Points=new Array(5000);
				for(i=0;i<5000;i++)
				{
					Points[i]=new Array(2);
				}
				var PointsID=[];//new Array(500);//[];
				var Count=0;//矩形框内点数
				for(i=0;i<ptnum;i++)
				{
					if(ptmercator[i][0] > minx && ptmercator[i][0] < maxx && ptmercator[i][1] > miny && ptmercator[i][1] < maxy)
					{
				//		alert(ptlayid[i]+'_'+ptid[i]+':'+ptmercator[i][0]+','+ptmercator[i][1]);
						Points[Count].x=(ptmercator[i][0]).toFixed(3);
						Points[Count].y=(ptmercator[i][1]).toFixed(3);
						PointsID.push(ptlayid[i]+'_'+ptid[i]);
						Count=Count+1;
					}
				}
				var pts=query.queryPointsInPolygon(Points,polygon);
				var result="";
				for(i=0;i<Count;i++)
				{
					for(j=0;j<pts.length;j++)
					{
						if(pts[j].x==Points[i].x && pts[j].y==Points[i].y)
						{
							result=result+PointsID[i]+'|';
							break;
						}
					}
				}
		//		OnShowResult("面内设备查询结果：",pts.length+':'+result);
				OnShowResult("面内设备查询结果：",result);
				lastpolygonpt=[];
				map.removeInteraction(draw);
			}
			if(IsMeasure>=1)
			{
				measuretype = 'None';
				map.removeInteraction(draw); //移除绘制图形
				map.removeOverlay(helpTooltip);
				IsMeasure=0;
			}
		});
//		var typeSelect = document.getElementById('type');

		var draw; // global so we can remove it later

		/**
		 * Format length output.
		 * @param {LineString} line The line.
		 * @return {string} The formatted length.
		 */
		var formatLength = function (line) {
		  var length = ol.sphere.getLength(line);
		  var output;
		  if (length > 100) {
			output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
		  } else {
			output = Math.round(length * 100) / 100 + ' ' + 'm';
		  }
		  return output;
		};

		/**
		 * Format area output.
		 * @param {Polygon} polygon The polygon.
		 * @return {string} Formatted area.
		 */
		var formatArea = function (polygon) {
		  var area = ol.sphere.getArea(polygon);
		  var output;
		  if (area > 10000) {
			output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
		  } else {
			output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
		  }
		  return output;
		};

		function addInteractionshape(value) {
	//	  var value = measuretype;
		  if (value !== 'None') {
			var geometryFunction;
			if (value === 'Square') {
			  value = 'Circle';
			  geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
			} else if (value === 'Box') {
			  value = 'Circle';
			  geometryFunction = ol.interaction.Draw.createBox();
			} else if (value === 'Star') {
			  value = 'Circle';
			  geometryFunction = function (coordinates, geometry) {
				var center = coordinates[0];
				var last = coordinates[coordinates.length - 1];
				var dx = center[0] - last[0];
				var dy = center[1] - last[1];
				var radius = Math.sqrt(dx * dx + dy * dy);
				var rotation = Math.atan2(dy, dx);
				var newCoordinates = [];
				var numPoints = 12;
				for (var i = 0; i < numPoints; ++i) {
				  var angle = rotation + (i * 2 * Math.PI) / numPoints;
				  var fraction = i % 2 === 0 ? 1 : 0.5;
				  var offsetX = radius * fraction * Math.cos(angle);
				  var offsetY = radius * fraction * Math.sin(angle);
				  newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
				}
				newCoordinates.push(newCoordinates[0].slice());
				if (!geometry) {
				  geometry = new ol.geom.Polygon([newCoordinates]);
				} else {
				  geometry.setCoordinates([newCoordinates]);
				}
				return geometry;
			  };
			}
			draw = new ol.interaction.Draw({
			  source: source,
			  type: value,
			  geometryFunction: geometryFunction,
			});
			map.addInteraction(draw);
		  }
		}

		function addInteraction() {
	//	  var type = typeSelect.value == 'area' ? 'Polygon' : 'LineString';
		  draw = new ol.interaction.Draw({
			source: source,
			type: measuretype,
			style: new ol.style.Style({
			  fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.2)',
			  }),
			  stroke: new ol.style.Stroke({
				color: 'rgba(0, 0, 0, 0.5)',
				lineDash: [10, 10],
				width: 2,
			  }),
			  image: new ol.style.Circle({
				radius: 5,
				stroke: new ol.style.Stroke({
				  color: 'rgba(0, 0, 0, 0.7)',
				}),
				fill: new ol.style.Fill({
				  color: 'rgba(255, 255, 255, 0.2)',
				}),
			  }),
			}),
		  });
		  map.addInteraction(draw);

		  createMeasureTooltip();
		  createHelpTooltip();

		  var listener;
		  draw.on('drawstart', function (evt) {
			// set sketch
			sketch = evt.feature;

			/** @type {import("../src/ol/coordinate.js").Coordinate|undefined} */
			var tooltipCoord = evt.coordinate;
			listener = sketch.getGeometry().on('change', function (evt) {
			  var geom = evt.target;
			  var output;
			  if (geom instanceof ol.geom.Polygon) {
				output = formatArea(geom);
				tooltipCoord = geom.getInteriorPoint().getCoordinates();
			  } else if (geom instanceof ol.geom.LineString) {
				output = formatLength(geom);
				tooltipCoord = geom.getLastCoordinate();
			  }
			  measureTooltipElement.innerHTML = output;
			  measureTooltip.setPosition(tooltipCoord);
			});
		  });

		  draw.on('drawend', function () {
			measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
			measureTooltip.setOffset([0, -7]);
			// unset sketch
			sketch = null;
			// unset tooltip so that a new one can be created
			measureTooltipElement = null;
		//	createMeasureTooltip();
			ol.Observable.unByKey(listener);
		  });
		}

		/**
		 * Creates a new help tooltip
		 */
		function createHelpTooltip() {
		  if (helpTooltipElement) {
			helpTooltipElement.parentNode.removeChild(helpTooltipElement);
		  }
		  helpTooltipElement = document.createElement('div');
		  helpTooltipElement.className = 'ol-tooltip hidden';
		  helpTooltip = new ol.Overlay({
			element: helpTooltipElement,
			offset: [15, 0],
			positioning: 'center-left',
		  });
		 map.addOverlay(helpTooltip);//测量模式下才显示
		}

		/**
		 * Creates a new measure tooltip
		 */
		function createMeasureTooltip() {
		  if (measureTooltipElement) {
			measureTooltipElement.parentNode.removeChild(measureTooltipElement);
		  }
		  measureTooltipElement = document.createElement('div');
		  measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
		  measureTooltip = new ol.Overlay({
			element: measureTooltipElement,//document.getElementById('anchor'),
			offset: [0, -15],
			positioning: 'bottom-center',
		  });
		  map.addOverlay(measureTooltip);//测量模式下才显示
		}

		/**
		 * Let user change the geometry type.
		 */
	//	typeSelect.onchange = function () {
	//	  map.removeInteraction(draw);
	//	  addInteraction();
	//	};

//		addInteraction();

		function drawEnd()//退出绘图状态
		{
			measuretype = 'None';
			map.removeInteraction(draw); //移除绘制图形
			IsMeasure=0;
		}

		function mdrawSquare()
		{
			map.removeInteraction(draw); //移除绘制图形
			IsMeasure=0;
			addInteractionshape('Square');//添加绘图进行测量
		}

		function mdrawBox()
		{
			map.removeInteraction(draw); //移除绘制图形
			IsMeasure=0;
			addInteractionshape('Box');//添加绘图进行测量
		}
		
		function mdrawStar()
		{
			map.removeInteraction(draw); //移除绘制图形
			IsMeasure=0;
			addInteractionshape('Star');//添加绘图进行测量
		}

		function mdrawCircle()
		{
			measuretype = 'Circle';
			map.removeInteraction(draw); //移除绘制图形
			IsMeasure=0;
			addInteraction();
		}

		function mdrawLineString()
		{
			measuretype = 'LineString';
			map.removeInteraction(draw); //移除绘制图形
			IsMeasure=0;
			addInteractionshape('LineString');//添加绘图进行测量
		}

		function mdrawPolygon()
		{
			measuretype = 'Polygon';
			map.removeInteraction(draw); //移除绘制图形
			IsMeasure=0;
			addInteractionshape('Polygon');//添加绘图进行测量
		}

		function measureLength()
		{
			map.removeOverlay(measureTooltip);
				IsCleaned=0;
				measuretype = 'LineString';
            map.removeInteraction(draw); //移除绘制图形
				addInteraction();//添加绘图进行测量
			IsMeasure=1;
		}

		function measureArea()
		{
			map.removeOverlay(measureTooltip);
				IsCleaned=0;
				measuretype = 'Polygon';
            map.removeInteraction(draw); //移除绘制图形
				addInteraction();//添加绘图进行测量
			IsMeasure=1;
		}

		function CleanMeasure()
		{
			map.removeOverlay(helpTooltip);
			map.removeOverlay(measureTooltip);
			vectordraw.getSource().clear();
			IsMeasure=0;
			operationmode=0;
		}

		function heatMap()
		{
			if(heatmapAdded==0) 
			{
				map.addLayer(vector);
				heatmapAdded=1;
			}
			else
			{
				map.removeLayer(vector);
				heatmapAdded=0;
			}
			IsMeasure=0;
		}

		function vctmap()//矢量图
		{
			if(maptype==2)
			{
				map.removeLayer(ImgMapLayer); //移除图层
				map.addLayer(MapLayer);
				maptype=1;
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else if(maptype==3)
			{
				map.removeLayer(ImgMapLayer); //移除图层
				map.removeLayer(ImgVctLayer); //移除图层
				map.addLayer(MapLayer);
				maptype=1;
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else return;
            view.setCenter(center); //定位
		}

		function imgmap()//影像图
		{
			if(maptype==1)
			{
				map.removeLayer(MapLayer); //移除图层
				map.addLayer(ImgMapLayer);
				maptype=2;
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else if(maptype==3)
			{
				map.removeLayer(ImgVctLayer); //移除图层
				maptype=2;
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else return;
            view.setCenter(center); //定位
		}

		function vctimg()//影像+路网
		{
			if(maptype==1)
			{
				map.removeLayer(MapLayer); //移除图层
				map.addLayer(ImgMapLayer);
				map.addLayer(ImgVctLayer);
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else if(maptype==2)
			{
				map.addLayer(ImgVctLayer);
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else return;
			maptype=3;
            view.setCenter(center); //定位
		}

        function DistanceWGS84(lng1,lat1,lng2,lat2)//计算结果单位:米
        {
           var radLat1 = lat1*3.1415926535898/180.0;
           var radLat2 = lat2*3.1415926535898/180.0;
           var a = radLat1 - radLat2;
           var b = (lng1 - lng2)*3.1415926535898/180.0;
           var dist = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
           dist = dist * 6378137;
           return dist;
        }

		//矢量图
        document.getElementById('vctmap').onclick = function () {
			if(maptype==2)
			{
				map.removeLayer(ImgMapLayer); //移除图层
				map.addLayer(MapLayer);
				maptype=1;
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else if(maptype==3)
			{
				map.removeLayer(ImgMapLayer); //移除图层
				map.removeLayer(ImgVctLayer); //移除图层
				map.addLayer(MapLayer);
				maptype=1;
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else return;
            view.setCenter(center); //定位
		};

       //影像图
        document.getElementById('imgmap').onclick = function () {
			if(maptype==1)
			{
				map.removeLayer(MapLayer); //移除图层
				map.addLayer(ImgMapLayer);
				maptype=2;
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else if(maptype==3)
			{
				map.removeLayer(ImgVctLayer); //移除图层
				maptype=2;
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else return;
            view.setCenter(center); //定位
		};
        //影像+路网
        document.getElementById('imgvct').onclick = function () {
			if(maptype==1)
			{
				map.removeLayer(MapLayer); //移除图层
				map.addLayer(ImgMapLayer);
				map.addLayer(ImgVctLayer);
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else if(maptype==2)
			{
				map.addLayer(ImgVctLayer);
				map.removeLayer(vectordraw)
				map.addLayer(vectordraw);			
			}
			else return;
			maptype=3;
            view.setCenter(center); //定位
        };

		//测长度
        document.getElementById('mLength').onclick = function () {
			 measureLength();
		};

       //测面积
        document.getElementById('mArea').onclick = function () {
			measureArea();

		};
        //清除测量结果
        document.getElementById('mClean').onclick = function () {
			CleanMap();
        };
        //热度图
        document.getElementById('heatmap').onclick = function () {
			heatMap();
        };
        //路径规划
//        document.getElementById('drawplan').onclick = function () {
//			SearchRouteResult();
		//	DrawRouteResultTest();
//        };
        //路径规划
        document.getElementById('carplan').onclick = function () {
	//		SearchRouteResult();
			DrawCarResult();
        };
        //路径规划
        document.getElementById('walkplan').onclick = function () {
	//		SearchRouteResult();
			DrawWalkResult();
		//	DrawRouteResultTest();
        };
/*
        document.getElementById('ClickTest').onclick = function () {
			var elem = document.querySelector('#map');
			var ev = document.createEvent('HTMLEvents'); 
			ev.clientX = 100;
			ev.clientY = 100;
			ev.initEvent('click', true, true); 
			elem.dispatchEvent(ev);		
	//		alert("click");
        };*/
// 指定标绘类型，开始绘制。
function activate(type) {
//    g_pol_layer.addFeature(type);
	drawEnd();
	g_pol_layer.plotDraw.activate(type);

};


function get(domId) {
    return document.getElementById(domId);
}


function activeDelBtn() {
//    get('btn-delete').style.display = 'inline-block';
}

function deactiveDelBtn() {
//    get('btn-delete').style.display = 'none';
}

function plotOperator(method, no_need_feature) {
    if (!g_op_feature) {
        alert('请选中图元后再进行操作')
        return;
    }
    g_pol_layer[method](g_op_feature);
}

//清除图形
function drawingClean(method, no_need_feature) {
	ptnum=0;
	lastptnum=0;
    g_pol_layer[method](g_op_feature);
}

function OnMouseDblDeleteSelectedMeta() {
	operationmode=1;
	selectmode=0;
}

function DeleteMetas(layerid,entid,metatype,symid) 
{
		g_pol_layer.LayerID = layerid;
		g_pol_layer.EntID = entid;
		g_pol_layer.MetaType = metatype;
		g_pol_layer.SymbolID = symid;
}

function OnMouseDblViewSelectedMeta(mode) {
	operationmode=mode;
	selectmode=0;
}

function setPlotActive(isActive) {
    if (!g_op_feature) {
        alert('请先选择一个标绘图元.屏蔽点击后将无法通过点击获取图元')
        return;
    }
    if(isActive)
	{
        g_op_feature.enable()
	}
    else
        g_op_feature.disable()
}


function setStyle(params) {
    if (!g_op_feature) {
        alert('请选中图元后再设置图元样式！')
        return;
    }
    var styles_value = document.getElementById('style-input').value;
    g_op_feature.setStyle(JSON.parse(styles_value))
}

//{"image":{"icon":{"src":"./assets/marker-begin.png","offset":[0,0],"opacity":1,"scale":1,"anchor":[0.5,0.5]}}}

function setPointMetaStyle(iconsrc,offset,opacity,scale,anchor) {
    if (!g_op_feature) {
        alert('请选中点图元后再设置图标样式！')
        return;
    }
    var styles_value = '{"image":{"icon":{"src":"'+iconsrc+'","offset":['+offset+'],"opacity":'+opacity+',"scale":'+scale+',"anchor":['+anchor+']}}}';
//	'{"fill":{"color":"'+fillcolor+'"},"stroke":{"color":"'+linecolor+'","width":'+linewidth+'}}';
		//"{'fill':{'color':'rgba("+fillcolor+"{'},'stroke':{'color':"+linecolor+"','width':"+2+"}}";
//	alert(styles_value)
    g_op_feature.setStyle(JSON.parse(styles_value))
}

function setMetaStyle(fillcolor,linecolor,linewidth) {
    if (!g_op_feature) {
        alert('请选中图元后再设置图元样式！')
        return;
    }
    var styles_value = '{"fill":{"color":"'+fillcolor+'"},"stroke":{"color":"'+linecolor+'","width":'+linewidth+'}}';
		//"{'fill':{'color':'rgba("+fillcolor+"{'},'stroke':{'color':"+linecolor+"','width':"+2+"}}";
//	alert(styles_value)
    g_op_feature.setStyle(JSON.parse(styles_value))
}

function setLineStyle(linecolor,linewidth,linedash) {
    if (!g_op_feature) {
        alert('请选中多段线后再设置多段线图元样式！')
        return;
    }
    var styles_value = '{"stroke":{"color":"'+linecolor+'","width":'+linewidth+',"lineDash":['+linedash+']}}';
		//"{'fill':{'color':'rgba("+fillcolor+"{'},'stroke':{'color':"+linecolor+"','width':"+2+"}}";
//	alert(styles_value)
    g_op_feature.setStyle(JSON.parse(styles_value))
}
//{"stroke":{"color":"#FF0000","width":3,"lineDash":[10,10,10]}}

//{"fill":{"color":"rgba(0,255,0,0.4)"},"stroke":{"color":"#FF0000","width":2}}

function addAttribute() {
    if (!g_op_feature) {
        alert('请选中图元后再添加属性！')
        return;
    }
    var key = document.getElementById('attr-input-key').value;
    var value = document.getElementById('attr-input-value').value;
    if (key && value)
    g_op_feature.setAttribute(key, value);
}

function addMetaAttribute(key,value) {
    if (!g_op_feature) {
        alert('请选中图元后再添加属性！')
        return;
    }
    if (key && value)
    g_op_feature.setAttribute(key, value);
}

function drawingpoly()//参数绘图
{
	var arr=[[113.395962,22.173622],[113.395962,22.273622],[113.495962,22.273622]];
		var pti;
		ptnum=3;
		for(i=0;i<ptnum;i++)
		{
			pti=ol.proj.fromLonLat([arr[i][0],arr[i][1]]);
			arr[i][0]=pti[0];
			arr[i][1]=pti[1];
		}
	g_pol_layer.plotDraw.drawingfinish('polygon',arr);// 多边形
}

function drawingcircle()//参数绘图
{
	var arr=[[113.395962,22.173622],[113.395962,22.273622]];
		var pti;
		ptnum=2;
		for(i=0;i<ptnum;i++)
		{
			pti=ol.proj.fromLonLat([arr[i][0],arr[i][1]]);
			arr[i][0]=pti[0];
			arr[i][1]=pti[1];
		}
	g_pol_layer.plotDraw.drawingfinish('circle',arr);// 多边形
}

function RndNum(n){
    var rnd="";
    for(var i=0;i<n;i++)
        rnd	+=	Math.floor(Math.random()*10);
    return rnd;
}

function Marker(id,ptmarker)//参数绘图
{
	iconid=id;
	icontype='.png';
	var arr=[[105,25.0]];
	var str=''+ptmarker;
	var arr0=str.split(",");
//	var start84 = ol.proj.transform([arr[0],arr[1]], 'EPSG:3857', 'EPSG:4326');
//	start=start84+'';
//	var pti;
//	pti=ol.proj.fromLonLat([arr[0][0],arr[0][1]]);
	arr[0][0]=parseFloat(arr0[0]);
	arr[0][1]=parseFloat(arr0[1]);
//	alert(arr);
	g_pol_layer.plotDraw.drawingfinish('marker',arr);// 多边形
}

function drawingMarker()//参数绘图
{
	iconid=35;
	icontype='.png';
	var arr=[[105,25.0]];
	var pti;
	pti=ol.proj.fromLonLat([arr[0][0],arr[0][1]]);
	arr[0][0]=pti[0]+1.0*RndNum(6);
	arr[0][1]=pti[1]+1.0*RndNum(6);
	g_pol_layer.plotDraw.drawingfinish('marker',arr);// 多边形
}

function Marker(x,y)//参数绘图
{
	iconid=35;
	icontype='.png';
	var arr=[[x,y]];
	var pti;
	pti=ol.proj.fromLonLat([arr[0][0],arr[0][1]]);
	arr[0][0]=pti[0]+1.0*RndNum(6);
	arr[0][1]=pti[1]+1.0*RndNum(6);
	g_pol_layer.plotDraw.drawingfinish('marker',arr);// 多边形
}


function DrawMapPoint(layid,symid,id,x,y)//参数绘图
{
	featurename=layid+"_"+id+"_marker_"+symid;
	iconid=symid;
	icontype='.png';
	var arr=[[x,y]];
	var pti;
	pti=ol.proj.fromLonLat([arr[0][0],arr[0][1]]);
	arr[0][0]=pti[0];
	arr[0][1]=pti[1];
	g_pol_layer.plotDraw.drawingfinish('marker',arr);// 多边形
}


function DrawAlarmPoint(layid,symid,id,x,y)//参数绘图
{
	featurename=layid+"_"+id+"_marker_"+symid;
	iconid=symid;
	icontype='.gif';
	var arr=[[x,y]];
	var pti;
	pti=ol.proj.fromLonLat([arr[0][0],arr[0][1]]);
	arr[0][0]=pti[0];
	arr[0][1]=pti[1];
	g_pol_layer.plotDraw.drawingfinish('marker',arr);// 多边形
}

function OnDrawMapPointi(i)//参数绘图
{
//	alert(id+"_"+layid+"_"+symid+"_"+x+","+y);
	featurename=ptlayid[i]+"_"+ptid[i]+"_marker_"+ptsym[i];
	iconid=ptsym[i];
	icontype='.png';
	var arr=[[ptarr[i][0],ptarr[i][1]]];
	var pti;
	pti=ol.proj.fromLonLat([arr[0][0],arr[0][1]]);
	arr[0][0]=pti[0];
	arr[0][1]=pti[1];
	//保存mercator坐标
	ptmercator[i][0]=pti[0];
	ptmercator[i][1]=pti[1];
	//
	g_pol_layer.plotDraw.drawingfinish('marker',arr);// 多边形
}

function DrawMapPoints()
{
	for(i=lastptnum;i<ptnum;i++)
	{
		setTimeout('OnDrawMapPointi('+i+')',0.005);//需要延时标注，否则只能标注一个图标 2021.6.9
	}
	lastptnum=ptnum;
}

function ImportPointLayerData(layid,symid,id,x,y)//参数绘图
{
	icontype='.png';
	ptarr[ptnum][0]=x;
	ptarr[ptnum][1]=y;
	ptid[ptnum]=id;
	ptlayid[ptnum]=layid;
	ptsym[ptnum]=symid;
	ptnum=ptnum+1;
}
/*
function OnDrawPolylineTest()
{
	DrawMapPolyline(2,1,'118.015010,31.193043,118.117911,31.379460,118.520705,31.466401,118.726647,31.261180,118.487665,31.047370,118.293955,30.994422',1,'#FF0000');
}

function OnDrawPolygonTest()
{
	DrawMapPolygon(3,1,'118.015010,31.193043,118.117911,31.379460,118.520705,31.466401,118.726647,31.261180,118.487665,31.047370,118.293955,30.994422','#FF0000','rgba(0,255,0,0.4)');
}
*/
function OnDrawCircleTest()
{
	OnDrawMapPoly(4,1,'118.015010,31.193043,118.117911,31.379460','circle','#FF0000','rgba(0,255,0,0.4)');
}

function DrawMapPolyline(layid,id,zbstr,isclosed,plcolor)//参数绘图
{
	featurename=layid+"_"+id+"_polyline";
	linecolor=plcolor;
	plarr=zbstr.split(","); //字符分割 
	plptnum=plarr.length/2;
	plptnum=parseInt(plptnum);
	var plptarr =  new Array(plptnum);   //表格有10行
	for(var i = 0;i < plptarr.length; i++)
	{
		plptarr[i] = new Array(2);    //每行有10列
	}

	for (i=0;i<2*plptnum-1;i=i+2) 
	{
		plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
		plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
	}
	var pti;
	for(i=0;i<plptnum;i++)
	{
		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		plptarr[i][0]=pti[0];
		plptarr[i][1]=pti[1];
	}
	if(isclosed==1)
	{
		plptarr[plptnum]=plptarr[0];
	}
	g_pol_layer.plotDraw.drawingfinish('polyline',plptarr);// 多段线
}


function ImportPolylineLayerData(layid,id,zbstr,isclosed,plcolor)
{
	plinearr[plinenum]=zbstr;
	plinelayid[plinenum]=layid;
	plineid[plinenum]=id;
	plineIsClosed[plinenum]=isclosed;
	plinecolor[plinenum]=plcolor;
	plinenum=plinenum+1;
}

function OnDrawMapPolylinei(i0)//参数绘图
{
//	alert(id+"_"+layid+"_"+symid+"_"+x+","+y);
	featurename=plinelayid[i0]+"_"+plineid[i0]+"_polyline";
	linecolor=plinecolor[i0];
	plarr=plinearr[i0].split(","); //字符分割 
	plptnum=plarr.length/2;

	var plptarr =  new Array(plptnum);   //表格有10行
	for(var i = 0;i < plptarr.length; i++)
	{
		plptarr[i] = new Array(2);    //每行有10列
	}
	for (i=0;i<2*plptnum-1;i=i+2) 
	{
		plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
		plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
	}
	var pti;
	for(i=0;i<plptnum;i++)
	{
		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		plptarr[i][0]=pti[0];
		plptarr[i][1]=pti[1];
	}
	if(plineIsClosed[i0]==1)
	{
		plptarr[plptnum]=plptarr[0];
	}
	g_pol_layer.plotDraw.drawingfinish('polyline',plptarr);// 多段线
}

function DrawMapPolylines()
{
	for(i=lastplinenum;i<plinenum;i++)
	{
		setTimeout('OnDrawMapPolylinei('+i+')',0.005);//需要延时标注，否则只能标注一个图标 2021.6.9
	}
	lastplinenum=plinenum;
}

function DrawMapPolygon(layid,id,zbstr,plcolor,solidcolor)//参数绘图
{
	featurename=layid+"_"+id+"_polygon";
	linecolor=plcolor;
	fillcolor=solidcolor;
	plarr=zbstr.split(","); //字符分割 
	plptnum=plarr.length/2;

	var plptarr =  new Array(plptnum);   //表格有10行
	for(var i = 0;i < plptarr.length; i++)
	{
		plptarr[i] = new Array(2);    //每行有10列
	}

	for (i=0;i<2*plptnum-1;i=i+2) 
	{
		plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
		plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
	}
	var pti;
	for(i=0;i<plptnum;i++)
	{
		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		plptarr[i][0]=pti[0];
		plptarr[i][1]=pti[1];
	}
	g_pol_layer.plotDraw.drawingfinish('polygon',plptarr);// 多段线
}

function Draw2MapPolygon(layid,id,zbstr,plcolor,solidcolor)//参数绘图
{
	featurename=layid+"_"+id+"_polygon";
	linecolor=plcolor;
	fillcolor=solidcolor;
	plarr=zbstr.split(","); //字符分割 
	plptnum=plarr.length/2;
    var xmin=100000;
	var xmax=0;
	var ymin=100000;
	var ymax=0;
	var plptarr =  new Array(plptnum);   //表格有10行
	for(var i = 0;i < plptarr.length; i++)
	{
		plptarr[i] = new Array(2);    //每行有10列
	}

	for (i=0;i<2*plptnum-1;i=i+2) 
	{
		plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
		plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
		xmin = Math.min(xmin, plptarr[i/2][0]);
		ymin = Math.min(ymin, plptarr[i/2][1]);
		xmax = Math.max(xmax, plptarr[i/2][0]);
		ymax = Math.max(ymax,plptarr[i/2][1]);
	}
	var LatPerPixelforZoomLevel10 = 0.0028472111142915;
//	var mapExtent = map.getView().calculateExtent(map.getSize());
//	var pts84=ol.proj.transform([mapExtent[0],mapExtent[1]], 'EPSG:3857', 'EPSG:4326');
//	var pte84=ol.proj.transform([mapExtent[2],mapExtent[3]], 'EPSG:3857', 'EPSG:4326');
//	var deltah=Math.abs(pte84[1]-pts84[1]);

	// 获取窗口宽度
	var winWidth=1920;
	var winHeight=912;
	if (window.innerWidth) 	winWidth = window.innerWidth;
	else if ((document.body) && (document.body.clientWidth)) winWidth = document.body.clientWidth;
	// 获取窗口高度
	if (window.innerHeight)	winHeight = window.innerHeight;
	else if ((document.body) && (document.body.clientHeight))	winHeight = document.body.clientHeight;
	// 通过深入 Document 内部对 body 进行检测，获取窗口大小
	if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
	{
		winHeight = document.documentElement.clientHeight;
		winWidth = document.documentElement.clientWidth;
	}
	// 获取窗口宽度
	if (window.innerWidth) winWidth = window.innerWidth;//这里写代码片`;
	else if ((document.body) && (document.body.clientWidth)) winWidth = document.body.clientWidth;
	// 获取窗口高度
	if (window.innerHeight) winHeight = window.innerHeight;
	else if ((document.body) && (document.body.clientHeight)) winHeight = document.body.clientHeight;
	// 通过深入 Document 内部对 body 进行检测，获取窗口大小
	if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
	{
		winHeight = document.documentElement.clientHeight;
		winWidth = document.documentElement.clientWidth;
	}
    var zoomlevelnew = 10 + (Math.log(LatPerPixelforZoomLevel10 / ((ymax - ymin) / winHeight)) / Math.log(2.0)) - 1;
	zoomlevelnew=parseInt(zoomlevelnew);
	SetZoom(zoomlevelnew);
	SetCenter((xmin+xmax)/2.0,(ymin+ymax)/2.0,0);
	//绘制图形
	var pti;
	for(i=0;i<plptnum;i++)
	{
		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		plptarr[i][0]=pti[0];
		plptarr[i][1]=pti[1];
	}
	g_pol_layer.plotDraw.drawingfinish('polygon',plptarr);// 多段线
}


function Draw2MapPolyline(layid,id,zbstr,isclosed,plcolor)//参数绘图
{
	featurename=layid+"_"+id+"_polyline";
	linecolor=plcolor;
	plarr=zbstr.split(","); //字符分割 
	plptnum=plarr.length/2;
	plptnum=parseInt(plptnum);
	var plptarr =  new Array(plptnum);   //表格有10行
	for(var i = 0;i < plptarr.length; i++)
	{
		plptarr[i] = new Array(2);    //每行有10列
	}
    var xmin=100000;
	var xmax=0;
	var ymin=100000;
	var ymax=0;
	for (i=0;i<2*plptnum-1;i=i+2) 
	{
		plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
		plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
		xmin = Math.min(xmin, plptarr[i/2][0]);
		ymin = Math.min(ymin, plptarr[i/2][1]);
		xmax = Math.max(xmax, plptarr[i/2][0]);
		ymax = Math.max(ymax,plptarr[i/2][1]);
	}
	var LatPerPixelforZoomLevel10 = 0.0028472111142915;
//	var mapExtent = map.getView().calculateExtent(map.getSize());
//	var pts84=ol.proj.transform([mapExtent[0],mapExtent[1]], 'EPSG:3857', 'EPSG:4326');
//	var pte84=ol.proj.transform([mapExtent[2],mapExtent[3]], 'EPSG:3857', 'EPSG:4326');
//	var deltah=Math.abs(pte84[1]-pts84[1]);

	// 获取窗口宽度
	var winWidth=1920;
	var winHeight=912;
	if (window.innerWidth) 	winWidth = window.innerWidth;
	else if ((document.body) && (document.body.clientWidth)) winWidth = document.body.clientWidth;
	// 获取窗口高度
	if (window.innerHeight)	winHeight = window.innerHeight;
	else if ((document.body) && (document.body.clientHeight))	winHeight = document.body.clientHeight;
	// 通过深入 Document 内部对 body 进行检测，获取窗口大小
	if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
	{
		winHeight = document.documentElement.clientHeight;
		winWidth = document.documentElement.clientWidth;
	}
	// 获取窗口宽度
	if (window.innerWidth) winWidth = window.innerWidth;//这里写代码片`;
	else if ((document.body) && (document.body.clientWidth)) winWidth = document.body.clientWidth;
	// 获取窗口高度
	if (window.innerHeight) winHeight = window.innerHeight;
	else if ((document.body) && (document.body.clientHeight)) winHeight = document.body.clientHeight;
	// 通过深入 Document 内部对 body 进行检测，获取窗口大小
	if (document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
	{
		winHeight = document.documentElement.clientHeight;
		winWidth = document.documentElement.clientWidth;
	}
    var zoomlevelnew = 10 + (Math.log(LatPerPixelforZoomLevel10 / ((ymax - ymin) / winHeight)) / Math.log(2.0)) - 1;
	zoomlevelnew=parseInt(zoomlevelnew);
	SetZoom(zoomlevelnew);
	SetCenter((xmin+xmax)/2.0,(ymin+ymax)/2.0,0);

	var pti;
	for(i=0;i<plptnum;i++)
	{
		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		plptarr[i][0]=pti[0];
		plptarr[i][1]=pti[1];
	}
	if(isclosed==1)
	{
		plptarr[plptnum]=plptarr[0];
	}
	g_pol_layer.plotDraw.drawingfinish('polyline',plptarr);// 多段线
}

function ImportPolygonLayerData(layid,id,zbstr,linecolor,fillcolor)
{
//	alert(layid+','+id+','+linecolor+','+fillcolor);
	polygonarr[polygonnum]=zbstr;
//	alert(polygonarr[polygonnum]);
	polygonlayid[polygonnum]=layid;
	polygonid[polygonnum]=id;
	polygonlinecolor[polygonnum]=linecolor;
	polygonfillcolor[polygonnum]=fillcolor;
	polygonnum=polygonnum+1;
}


function OnDrawMapPolygoni(i0)//参数绘图
{
	featurename=polygonlayid[i0]+"_"+polygonid[i0]+"_polygon";
	linecolor=polygonlinecolor[i0];
	fillcolor=polygonfillcolor[i0];
	plarr=polygonarr[i0].split(","); //字符分割 
	plptnum=plarr.length/2;

	var plptarr =  new Array(plptnum);   //表格有10行
	for(var i = 0;i < plptarr.length; i++)
	{
		plptarr[i] = new Array(2);    //每行有10列
	}

	for (i=0;i<2*plptnum-1;i=i+2) 
	{
		plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
		plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
	}
	var pti;
	for(i=0;i<plptnum;i++)
	{
		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		plptarr[i][0]=pti[0];
		plptarr[i][1]=pti[1];
	}
	g_pol_layer.plotDraw.drawingfinish('polygon',plptarr);// 多段线
}

function DrawMapPolygons()
{
	for(i=lastpolygonnum;i<polygonnum;i++)
	{
		setTimeout('OnDrawMapPolygoni('+i+')',0.01);//需要延时标注，否则只能标注一个图标 2021.6.9
	}
	lastpolygonnum=polygonnum;
}


function OnDrawMapPoly(layid,id,type,zbstr,plcolor,solidcolor)//参数绘图
{
	featurename=layid+"_"+id+"_"+type;
	alert(featurename);
	linecolor=plcolor;
	fillcolor=solidcolor;
	plarr=zbstr.split(","); //字符分割 
	plptnum=plarr.length/2;

	var plptarr =  new Array(plptnum);   //表格有10行
	for(var i = 0;i < plptarr.length; i++)
	{
		plptarr[i] = new Array(2);    //每行有10列
	}

	for (i=0;i<2*plptnum-1;i=i+2) 
	{
		plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
		plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
	}
	var pti;
	for(i=0;i<plptnum;i++)
	{
		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		plptarr[i][0]=pti[0];
		plptarr[i][1]=pti[1];
	}
	g_pol_layer.plotDraw.drawingfinish(type,plptarr);// 多段线
}


function ImportPolyLayerData(layid,id,type,zbstr,linecolor,fillcolor)
{
	polyarr[polynum]=zbstr;
	polylayid[polynum]=layid;
	polyid[polynum]=id;
	polytype[polynum]=type;
	polylinecolor[polynum]=linecolor;
	polyfillcolor[polynum]=fillcolor;
	polynum=polynum+1;
}

function OnDrawMapPolyi(i0)//参数绘图
{
	featurename=polylayid[i0]+"_"+polyid[i0]+"_"+polytype[i0];
	linecolor=polylinecolor[i0];
	fillcolor=polyfillcolor[i0];
	plarr=polyarr[i0].split(","); //字符分割 
	plptnum=plarr.length/2;

	var plptarr =  new Array(plptnum);   //表格有10行
	for(var i = 0;i < plptarr.length; i++)
	{
		plptarr[i] = new Array(2);    //每行有10列
	}

	for (i=0;i<2*plptnum-1;i=i+2) 
	{
		plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
		plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
	}
	var pti;
	for(i=0;i<plptnum;i++)
	{
		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		plptarr[i][0]=pti[0];
		plptarr[i][1]=pti[1];
	}
	g_pol_layer.plotDraw.drawingfinish(polytype[i0],plptarr);// 多段线
}

function DrawMapPolys()
{
	for(i=lastpolynum;i<polynum;i++)
	{
		setTimeout('OnDrawMapPolyi('+i+')',0.005);//需要延时标注，否则只能标注一个图标 2021.6.9
	}
	lastpolynum=polynum;
}

function OnMouseDrawPoint(metatype,symid)
{
	iconid=symid;
	featurename="0_0_"+metatype+"_"+symid;
	activate(metatype);
}

function OnMouseDrawPoly(metatype)
{
	featurename="0_0_"+metatype;
	activate(metatype);
}

function drawingMarkerTest()
{
		for(i=0;i<5000;i++)
		{
			setTimeout('drawingMarker()',0.01);//需要延时标注，否则只能标注一个图标 2021.6.9
		}
}

function OnClickSelectPOI() {
    if (!g_op_feature) {
        alert('请选中图元后再查询属性！')
        return;
    }
//	alert(g_op_feature.getName());
	OnShowResult("属性查询结果",g_op_feature.getName());
}

function GetMetaAttribute() {
    if (!g_op_feature) {
        alert('请选中图元后再查询属性！')
        return;
    }
	if(keyvalue=="") 	
		OnShowResult("属性查询结果",JSON.stringify(g_op_feature.getStyle())+"|"+g_op_feature.getName());
	//alert(JSON.stringify(g_op_feature.getStyle())+"|"+g_op_feature.getName());
	else 
	OnShowResult("属性查询结果",keyname+":"+keyvalue+"|"+JSON.stringify(g_op_feature.getStyle())+"|"+g_op_feature.getName());
	//alert(keyname+":"+keyvalue+"|"+JSON.stringify(g_op_feature.getStyle())+"|"+g_op_feature.getName());
}

function GetMetaPoints() {
    if (!g_op_feature) {
        alert('请选中图元后再查询坐标！')
        return;
    }
	var points = g_pol_layer.plotEdit.activePlot.getGeometry().getPoints();
//	alert(points);
	OnShowResult("坐标查询结果",points);
}

function OnSavePointInfo() {
    if (!g_op_feature) {
        alert('请选中图元后再查询坐标！')
        return;
    }
	var points = g_pol_layer.plotEdit.activePlot.getGeometry().getPoints();
	//麦卡托转经纬度
/*
	var str=''+start;
	var arr=str.split(",");
	var start84 = ol.proj.transform([arr[0],arr[1]], 'EPSG:3857', 'EPSG:4326');
	start=start84+'';
	var str1=''+end;
	var arr1=str1.split(",");
	var end84 = ol.proj.transform([arr1[0],arr1[1]], 'EPSG:3857', 'EPSG:4326');
	end=end84+'';
*/
	var point84 = ol.proj.transform([points[0][0],points[0][1]], 'EPSG:3857', 'EPSG:4326');
//	alert(point84);
//	alert(g_op_feature.getName()+'|'+points);
	window.open("SavePointInfo.jsp?LayerID=1"+"&SYMBOLID=35"+"&X="+point84[0]+"&Y="+point84[1],"Info");
}

function OnSavePolyInfo() {
    if (!g_op_feature) {
        alert('请选中图元后再查询坐标！')
        return;
    }
	var metaname = g_op_feature.getName().split("_");
//	alert(metaname[2]);
	var points = g_pol_layer.plotEdit.activePlot.getGeometry().getPoints();
	//麦卡托转经纬度
/*
	var str=''+start;
	var arr=str.split(",");
	var start84 = ol.proj.transform([arr[0],arr[1]], 'EPSG:3857', 'EPSG:4326');
	start=start84+'';
	var str1=''+end;
	var arr1=str1.split(",");
	var end84 = ol.proj.transform([arr1[0],arr1[1]], 'EPSG:3857', 'EPSG:4326');
	end=end84+'';
*/
	var plarr=(points+'').split(",");
	plptnum=plarr.length/2;
	var plptarr =  new Array(plptnum);   //表格有10行
	for(var i = 0;i < plptarr.length; i++)
	{
		plptarr[i] = new Array(2);    //每行有10列
	}

	for (i=0;i<2*plptnum-1;i=i+2) 
	{
		plptarr[i/2][0]=Number(plarr[i]);//转为数字，否则出错
		plptarr[i/2][1]=Number(plarr[i+1]);//转为数字，否则出错
	}
	var pti84;
	for(i=0;i<plptnum;i++)
	{
//		pti=ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		pti84=ol.proj.transform([plptarr[i][0],plptarr[i][1]], 'EPSG:3857', 'EPSG:4326');
	//		ol.proj.fromLonLat([plptarr[i][0],plptarr[i][1]]);
		plptarr[i][0]=pti84[0];
		plptarr[i][1]=pti84[1];
	}

//	alert(plptarr);
	window.open("SavePolyInfo.jsp?LayerID=2"+"&METATYPE="+metaname[2]+"&ZBSTR="+plptarr,"Info");
}

	function SetCenter(x,y,mode)
	{
		if(mode==1)
		{
			OnDrawMapPoint(0,35,0,x,y);
		}
		var cen = ol.proj.transform([x,y], 'EPSG:4326', 'EPSG:3857');
		var view=map.getView();
		view.setCenter(cen);
	}

	function SetZoom(zoom)
	{
		var view=map.getView();
		view.setZoom(zoom);
	}

	function SetCenterAndZoom(x,y,zoom,mode)
	{
		var cen = ol.proj.transform([x,y], 'EPSG:4326', 'EPSG:3857');
		var view=map.getView();
		view.setCenter(cen);
		view.setZoom(zoom);
		if(mode==1)
		{
			OnDrawMapPoint(0,35,0,x,y);
		}
	}

	function Zoomin()
	{
		var zoom=map.getView().getZoom();
		map.getView().setZoom(zoom+1);
	}

	function Zoomout()
	{
		var zoom=map.getView().getZoom();
		map.getView().setZoom(zoom-1);
	}


function OnSetSelectMode(mode)
{
	operationmode=0;
	selectmode=mode;
	if(mode==2)
	{
		x1=0;
		x2=0;
		y1=0;
		y2=0;
		mdrawCircle();
	}
	else if(mode==3)
	{
		x1=0;
		x2=0;
		y1=0;
		y2=0;
		mdrawBox();
	}
	else if(mode==4) mdrawPolygon();
	else if(mode==5) mdrawLineString();
}

function OnPointsInPolygonTest()
{
var points=[{x:13180667.087,y:3676615.198},{x:13181910.415,y:3675946.743},{x:13181951.046,y:3676208.829},{x:13180997.595,y:3676159.174},{x:13181371.072,y:3676175.596},{x:13181040.008,y:3675771.848},{x:13181343.687,y:3675809.642}];
	var poly=[[13180719.029,3676202.645],[13180996.201,3676502.914],[13181513.589,3676470.578],[13182614.128,3675412.705],[13182114.128,3675412.705],[13180769.844,3675440.422]];
//	var polyg=[{x:13180719.029,y:3676202.645},{x:13180996.201,y:3676502.914},{x:13181513.589,y:3676470.578},{x:13182114.128,y:3675412.705},{x:13180769.844,y:3675440.422}];
//	var polygon=[{x:13180769.844,y:3675440.422},{x:13182114.128,y:3675412.705},{x:13181513.589,y:3676470.578},{x:13180996.201,y:3676502.914},{x:13180719.029,y:3676202.645}]
/*	var points=new Array(14);
	for(i=0;i<14;i++)
	{
		points[i]=new Array(2);
	}
	points[0].x=13180667.087;
	points[0].y=3676615.198;
	points[1].x=13181910.415;
	points[1].y=3675946.743;
	points[2].x=13181951.046;
	points[2].y=3676208.829;
	points[3].x=13180997.595;
	points[3].y=3676159.174;
	points[4].x=13181371.072;
	points[4].y=3676175.596;
	points[5].x=13181040.008;
	points[5].y=3675771.848;
	points[6].x=13181343.687;
	points[6].y=3675809.642;
	var pt7 = ol.proj.transform([118.4123340,31.3300434], 'EPSG:4326', 'EPSG:3857');
	points[7].x=pt7[0];
	points[7].y=pt7[1];
	var pt8 = ol.proj.transform([118.4146639,31.3290172], 'EPSG:4326', 'EPSG:3857');
	points[8].x=pt8[0];
	points[8].y=pt8[1];
	var pt9 = ol.proj.transform([118.4128295,31.3348285], 'EPSG:4326', 'EPSG:3857');
	points[9].x=pt9[0];
	points[9].y=pt9[1];
	var pt10 = ol.proj.transform([118.4165307,31.3289866], 'EPSG:4326', 'EPSG:3857');
	points[10].x=pt10[0];
	points[10].y=pt10[1];
	var pt11 = ol.proj.transform([118.4163698,31.3282650], 'EPSG:4326', 'EPSG:3857');
	points[11].x=pt11[0];
	points[11].y=pt11[1];
	var pt12 = ol.proj.transform([118.4138386,31.3345295], 'EPSG:4326', 'EPSG:3857');
	points[12].x=pt12[0];
	points[12].y=pt12[1];
	var pt13 = ol.proj.transform([118.4201362,31.3292572], 'EPSG:4326', 'EPSG:3857');
	points[13].x=pt13[0];
	points[13].y=pt13[1];
*/
	var polygon=new Array(6);
	for(i=0;i<6;i++)
	{
		polygon[i]=new Array(2);
	}
		polygon[0].x=13180769.844;
		polygon[0].y=3675440.422;
		var pt = ol.proj.transform([118.4281742,31.3281428], 'EPSG:4326', 'EPSG:3857');
		polygon[1].x=pt[0];
		polygon[1].y=pt[1];
		polygon[2].x=13182114.128;
		polygon[2].y=3675412.705;
		polygon[3].x=13181513.589;
		polygon[3].y=3676470.578;
		polygon[4].x=13180996.201;
		polygon[4].y=3676502.914;
		polygon[5].x=13180719.029;
		polygon[5].y=3676202.645;

	//	alert(polygon[0].x+','+polygon[0].y);
//	OnShowResult("多边形查询结果：",points+':'+polygon);
	var ptresult="";
	var pts=query.queryPointsInPolygon(points,polygon);
	for(i=0;i<pts.length;i++)
	{
	//	alert((i+1)+'/'+pts.length+':'+pts[i].x+','+pts[i].y);
		ptresult=ptresult+pts[i].x+','+pts[i].y+'|';
	}
//	OnShowResult("面内坐标点查询结果：",(pts.length+1)+':'+ptresult);
	g_pol_layer.plotDraw.drawingfinish('polygon',poly);// 多段线
}

//以下为离散点外包凸多边形计算代码  20210722
     /**
     * 对离散点排序：按照其与基点构成的向量与x轴正方向夹角余弦值快速降序
     * @param basePoint 基点
     * @param discretePointArray 需要排序的离散点集
     * @param left 左指示变量
     * @param right 右指示变量
     * @returns {*}
     */
    function quickSort(basePoint, discretePointArray, left, right) {
        var i = left;
        var j = right;
        var temp = discretePointArray[left];
        var tempV = new Vector(basePoint, temp);
        while (i < j) {
            while (i < j && tempV.cosx > new Vector(basePoint, discretePointArray[j]).cosx) {
                j--;
            }
            if (i < j) {
                discretePointArray[i++] = discretePointArray[j];
            }
            while (i < j && tempV.cosx < new Vector(basePoint, discretePointArray[i]).cosx) {
                i++;
            }
            if (i < j) {
                discretePointArray[j--] = discretePointArray[i];
            }
        }
        discretePointArray[i] = temp;
        if (left < i) {
            quickSort(basePoint, discretePointArray, left, i - 1);
        }
        if (right > i) {
            quickSort(basePoint, discretePointArray, i + 1, right);
        }
 
        return discretePointArray;
    }
   /**
     * 获取基点：在离散点集中选取y坐标最小的点，当作开始点
     * 如果存在多个点的y坐标都为最小值，则选取x坐标最小的一点
     * @param vertexSet 离散点集
     * @returns {*}
     */
    function getBasePoint(vertexSet) {
        if (vertexSet != null && vertexSet.length > 0) {
            var point = vertexSet[0];
            for (var i = 1; i < vertexSet.length; i++) {
                //最小y（多个y相同时，选择x最小的点）
                if (vertexSet[i].y < point.y ||
                    ((vertexSet[i].y == point.y) && (vertexSet[i].x < point.x))) {
                    point = vertexSet[i];
                }
            }
 
            return point;
        }
 
        return null;
    }
    /**
     * 获取离散点集凸包
     * @param cosArr 排序后的离散点集
     * @returns {Array}
     */
    function getPolygonVertexSet(cosArr) {
        //凸包点集数组
        var polygonArr = [];
        //开始获取（按逆时针扫描，如果排序时升序则需要顺时针扫描）
        if (cosArr != null && cosArr.length > 0) {
            polygonArr.push(cosArr[0]); //基点肯定是多边形顶点
            if (cosArr.length > 1) {
                polygonArr.push(cosArr[1]); //第一个夹角最小的点肯定是多边形顶点
            }
            if(cosArr.length > 2){
                polygonArr.push(cosArr[2]); //无论是否是多边形顶点直接放入（回溯中可能会被删除）
            }
            for (var i = 3; i < cosArr.length; i++) {
                var len = polygonArr.length;
                var leftVector = new Vector(polygonArr[len - 2], polygonArr[len - 1]);
                var rightVector = new Vector(polygonArr[len - 1], cosArr[i]);
                while (leftVector.cross(rightVector) < 0) {//向量叉积小于0时回溯
                    polygonArr.splice(len - 1, 1);//删除最后一个元素
                    len = polygonArr.length;    //删除后，len有变化，需要重新设置
                    leftVector = new Vector(polygonArr[len - 2], polygonArr[len - 1]);
                    rightVector = new Vector(polygonArr[len - 1], cosArr[i]);
                }
                polygonArr.push(cosArr[i]);
            }
        }
 
        return polygonArr;
    }
    /**
     * 平面向量对象
     * @param start 向量始点
     * @param end 向量终点
     * @constructor
     */
    function Vector(start0, end0) {
        this.start = start0;
        this.end = end0;
        // 向量坐标
        this.x = this.end.x - this.start.x;
        this.y = this.end.y - this.start.y;
        // 向量与x轴正向的夹角余弦值
        // 零向量(0,0)与x轴正向的夹角余弦值定义为2,按余弦值降序排序时排在第一个位置
        this.cosx = (this.x == 0 && this.y == 0) ? 2
            : (this.x / Math.sqrt(this.x * this.x + this.y * this.y));
        // 向量叉积
        this.cross = function (that) {
            var result = this.x * that.y - that.x * this.y;
 
            return result;
        }
        //绘制向量
        this.draw = function () {
            context.moveTo(this.start.x, this.start.y);       //设置起点状态
            context.lineTo(this.end.x, this.end.y);       //设置末端状态
            context.lineWidth = 1;          //设置线宽状态
            context.strokeStyle = "red";  //设置线的颜色状态
            context.stroke();               //进行绘制
        }
    }
 
	function OnDrawOuterPolygonTest()
	{
		var ptstr='118.34158,31.241211,118.28141,31.237828,118.304828,31.253394,118.313632,31.21702,118.281361,31.227416,118.386964,31.176098,118.265765,31.212886,118.388043,31.24204,118.296944,31.159976,118.386494,31.208377,118.343476,31.244198,118.384649,31.206305,118.328173,31.224263,118.275383,31.211834,118.383384,31.186192,118.343427,31.244175,118.328211,31.224268,118.328179,31.224249,118.341816,31.241193,118.382305,31.205848,118.328318,31.224089,118.335021,31.23077,118.381874,31.194559,118.38184,31.194529,118.335138,31.230646,118.335053,31.230821';

		var ptsarr=ptstr.split(",");
		var ptsnum=ptsarr.length/2;
//		alert(ptsnum+'');
		var ptarr =  new Array(ptsnum);   //表格有10行
		for(var i = 0;i < ptarr.length; i++)
		{
			ptarr[i] = new Array(2);    //每行有10列
		}
		//
		var ptarr0 =  new Array(ptsnum);   //表格有10行
		for(var i = 0;i < ptarr0.length; i++)
		{
			ptarr0[i] = new Array(2);    //每行有10列
		}
		//
		for (i=0;i<2*ptsnum-1;i=i+2) 
		{
			ptarr0[i/2][0]=Number(ptsarr[i]);//转为数字，否则出错
			ptarr0[i/2][1]=Number(ptsarr[i+1]);//转为数字，否则出错
			ptarr[i/2].x=Number(ptsarr[i]);//转为数字，否则出错
			ptarr[i/2].y=Number(ptsarr[i+1]);//转为数字，否则出错
		}


       //获取基点
        var basePoint = getBasePoint(ptarr);
        //余弦值从大到小排序，基点会直接排在第一个
        ptarr = quickSort(basePoint, ptarr, 0, ptarr.length - 1);
        //获取离散点集凸多边形顶点
		var result="";
        var polygonVertexSet = getPolygonVertexSet(ptarr);
        for (var i = 0; i < polygonVertexSet.length; i++) {
     //       alert(i+1+'/'+polygonVertexSet.length+':'+polygonVertexSet[i].x + "," + polygonVertexSet[i].y);
			result=result+polygonVertexSet[i].x + "," + polygonVertexSet[i].y+',';
        }
//		OnShowResult("面内坐标点查询结果：",result);
	//	return result;
		for(i=0;i<ptsnum;i++)
		{
			setTimeout('OnDrawMapPoint(1,35,'+i+1+','+ptarr0[i][0]+','+ptarr0[i][1]+')',0.05);//需要延时标注，否则只能标注一个图标 2021.6.9
		}
		OnDrawMapPolyline(2,1,result,1,'#FF0000');
	}

	function OnDrawOuterPolygon(ptstr)
	{
//		var ptstr='118.34158,31.241211,118.28141,31.237828,118.304828,31.253394,118.313632,31.21702,118.281361,31.227416,118.386964,31.176098,118.265765,31.212886,118.388043,31.24204,118.296944,31.159976,118.386494,31.208377,118.343476,31.244198,118.384649,31.206305,118.328173,31.224263,118.275383,31.211834,118.383384,31.186192,118.343427,31.244175,118.328211,31.224268,118.328179,31.224249,118.341816,31.241193,118.382305,31.205848,118.328318,31.224089,118.335021,31.23077,118.381874,31.194559,118.38184,31.194529,118.335138,31.230646,118.335053,31.230821';

		var ptsarr=ptstr.split(",");
		var ptsnum=ptsarr.length/2;
//		alert(ptsnum+'');
		var ptarr =  new Array(ptsnum);   //表格有10行
		for(var i = 0;i < ptarr.length; i++)
		{
			ptarr[i] = new Array(2);    //每行有10列
		}
		for (i=0;i<2*ptsnum-1;i=i+2) 
		{
		//	ptarr[i/2][0]=Number(ptsarr[i]);//转为数字，否则出错
		//	ptarr[i/2][1]=Number(ptsarr[i+1]);//转为数字，否则出错
			ptarr[i/2].x=Number(ptsarr[i]);//转为数字，否则出错
			ptarr[i/2].y=Number(ptsarr[i+1]);//转为数字，否则出错
		}
       //获取基点
        var basePoint = getBasePoint(ptarr);
        //余弦值从大到小排序，基点会直接排在第一个
        ptarr = quickSort(basePoint, ptarr, 0, ptarr.length - 1);
        //获取离散点集凸多边形顶点
		var result="";
        var polygonVertexSet = getPolygonVertexSet(ptarr);
        for (var i = 0; i < polygonVertexSet.length; i++) {
     //       alert(i+1+'/'+polygonVertexSet.length+':'+polygonVertexSet[i].x + "," + polygonVertexSet[i].y);
			result=result+polygonVertexSet[i].x + "," + polygonVertexSet[i].y+',';
        }
	//	OnShowResult("面内坐标点查询结果：",result);
		return result;
	}
