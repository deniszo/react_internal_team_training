"use strict";


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

var HierarchyComponent = React.createClass({

    render: function() {

        return  (
            <div className="wrapper">
                <div className="dropdown">
                    <div className="toggle--down"></div>
                    <div className="text">National</div>
                </div>
                <div className="body">
                    <div className="header">
                        <input type="text" className="search-input" placeholder="Search" />
                        <div className="breadcrumb">
                            <span>Top</span><span className="selected">National</span>
                        </div>
                    </div>
                    <ul className="list">
                        <li className="item">
                            <div className="text" style={ { width: '90%' } }>Best Buy</div>
                            <div className="expand"></div>
                        </li>
                        <li className="item">
                            <div className="text active" style={ { width: '100%' } }>Best Buy Mobile</div>
                        </li>
                    </ul>
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
