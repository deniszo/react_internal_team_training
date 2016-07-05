"use strict";

// data является в данном случае нашим источником данных и имеет 3 метода

var data = (function() {

    var data = [
        {
            title: "National",
            parent: 'Top',
            hasChildren: true
        },
        {
            title: "Best Buy",
            parent: "National",
            hasChildren: true
        },
        {
            title: "Best Buy Mobile",
            parent: "National",
            hasChildren: false
        },
        {
            title: "Western",
            parent: "Best Buy",
            hasChildren: false
        },
        {
            title: "Central",
            parent: "Best Buy",
            hasChildren: false
        },
        {
            title: "Eastern",
            parent: "Best Buy",
            hasChildren: false
        }
    ];

    var mappedData = BuildMap(data);

    function getItems() {
        return data;
    }

    function BuildMap(data) {
        var map = {};

        data.forEach(function(item) {
            map[item.title] = { title: item.title, parent: item.parent };
        });

        return map;
    }

    function buildBreadCrumb(node, map) {
        var current = node;
        var breadcrumb = [];

        while (map.hasOwnProperty(current)) {
            breadcrumb.push(current);
            current = map[current].parent
        }

        breadcrumb.push('Top');

        return breadcrumb.reverse();
    }

    function getParentName(node) {
        return mappedData[node].parent;
    }

    return {
        getItems: getItems,
        getParentName: getParentName,
        buildBreadcrumb: function(node) {
            return buildBreadCrumb(node, mappedData);
        }
    }

})();


// Начало нашего приложения. Было принято решение отрефакторить код, чтобы не загромождать наш главный компонент HierarchyComponent функционалом, отвечающим за вызов  


// Обратите внимание - компоненты, которые не имеют внутреннего состояния, а только отображают данные, которые приходят из родительского компонета или вызывают метода родителя представлены обычными функциями, которые принимают объект props в качестве аргумента и возвращают JSX код


// Элемент списка иерархии
var NodeItem = function(props) {

    // логика отображения теперь полностью реализуется внутри этого компонента
    var style = { width: (props.node.hasChildren ? '90%' : '100%') };

    // (1) В качестве props.children будет выступать содержимое, передаваемое в родительском компоненте -> (2)
    return (

        <li className="item">
            <div className="text" style={ style }>{ props.node.title }</div>
            { props.children }
        </li>

    );
}


var DrillDown = function(props) {

    // (3) Который в свою очередь возращает либо разметку кнопки с обработчиком, либо null. Все эти манипуляции позволяют нам максимально упростить код главного компонента -> (4) в самом низу
    return (

        props.show
            ? <div className="expand" onClick={ function(e) { props.drilldown(props.toLevel) } }></div>
            : null

    );
}

var NodeList = function(props) {

    return (

        <ul className="list">
            {
                props.items.
                map(function(item) {

                    // (2) В качестве props.children выступает элемент DrillDown -> (3)
                    return (
                        <NodeItem node={ item }>
                            <DrillDown drilldown={ props.setLevel } toLevel={ item.title } show={ item.hasChildren }/>
                        </NodeItem>
                    );
                })
            }
        </ul>

    );
};

var HierarchyComponent = React.createClass({


    getInitialState: function() {

        return {
            toggle: false,
            parentFilter: 'Top'
        }
    },

    toggle: function() {
        this.setState({ toggle: !this.state.toggle });
        console.log(this.state.toggle);
    },

    getItems: function() {

        var self = this;

        return data.getItems().
        filter(function(item, id) {
            return item.parent === self.state.parentFilter;
        });
    },

    setParentFilter: function(parent) {
        this.setState({ parentFilter: parent });
    },

    render: function() {

        var style = { display: (!this.state.toggle ? 'none' : 'initial') };

        var className = (!this.state.toggle ? 'toggle' : 'toggle--down');


        // (4) Всю логику построения разметки и работы с состоянием мы переложили на компонент NodeList и его вложенные компоненты
        return  (
            <div className="wrapper">
                <div className="dropdown" onClick={ this.toggle } >
                    <div className={ className }></div>
                    <div className="text">National</div>
                </div>
                <div style={ style } className="body">
                    <div className="header">
                        <input type="text" className="search-input" placeholder="Search" />
                        <div className="breadcrumb">
                            <span>Top</span><span className="selected">National</span>
                        </div>
                    </div>
                    <NodeList items={ this.getItems() } setLevel={ this.setParentFilter } />
                    <div className="footer">
                        <a className="cancel">Cancel</a>
                        <button className="select">Apply</button>
                    </div>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
    <HierarchyComponent />,
    document.getElementById('hierarchy')
);
