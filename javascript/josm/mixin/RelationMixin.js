(function () {	
/**
 * <p>This module is auto-loaded by the scripting plugin and mixed into the 
 * native java class {@class org/openstreetmap/josm/data/osm/Relation}.</p>
 * 
 * @module josm/mixin/RelationMixin
 */

var util = require("josm/util");
var RelationMember = org.openstreetmap.josm.data.osm.RelationMember;
var OsmPrimitive = org.openstreetmap.josm.data.osm.OsmPrimitive;
var List = java.util.List;

var mixin = {};

/**
 * <p>This mixin  provides additional properties and methods which you can invoke on an instance of
 * {@class org/openstreetmap/josm/data/osm/Relation}.</p>
 *  
 * <p>You can access relation members using 
 * <pre>relation[i]</pre>, 
 * see examples below.
 * 
 * @example 
 * var Relation = org.openstreetmap.josm.data.osm.Relation;
 * var out = java.lang.System.out;
 * var relation = new Relation(12345);
 *  
 * // use the mixin property 'id' to access the relation id ... 
 * var id = relation.id;
 *  
 * // ... or the native method getUniqueId()
 * id = relation.getUniqueId();
 *  
 * // loop over relation members and print out the roles 
 * for (var i=0; i < relation.length; i++) {
 *    out.println(relation[i].role);
 * }
 * 
 * @mixin RelationMixin
 * @extends OsmPrimitiveMixin
 * @forClass org.openstreetmap.josm.data.osm.Relation
 * @memberof josm/mixin/RelationMixin
 */

/**
 * Replies the number of relation members.
 * 
 * @memberOf RelationMixin
 * @name length
 * @field
 * @type {number}
 * @instance
 * @readOnly
 * @summary Replies the number of relation members.
 */
mixin.length = {
	get: function() {
		return this.getMembersCount();
	}
}

function memberListEquals(l1,l2) {
	if (l1.length != l2.length) return false;
	for (var i=0; i< l1.length; i++) {
		if (! l1[i].equals(l2[i])) return false;
	}
	return true;
};

/**
 * <p>The relation members</p>
 * 
 * <dl>
 *   <dt>get</dt>
 *   <dd>replies the current list of relation members as javascript array.</dd>
 *   
 *   <dt>set</dt>
 *   <dd>Assign the list of relation members. Assign null or undefined to remove all members.
 *    Assign an array or a java.util.List of members. Members can be instances of 
 *    {@class org/openstreetmap/josm/data/osm/RelationMember},
 *    {@class org/openstreetmap/josm/data/osm/Node},
 *    {@class org/openstreetmap/josm/data/osm/Way}, or
 *    {@class org/openstreetmap/josm/data/osm/Relation}. 
 *    null or undefined are ignored.<br/>
 *    <strong>Note:</strong> you can't assign members to a proxy relation.
 *   </dd>
 * </dl>
 * @example
 * var rb = require("josm/builder").RelationBuilder;
 * var nb = require("josm/builder").NodeBuilder;
 * var relation = rb.create();
 * 
 * // set members 
 * relation.members = [nb.create(), rb.member('role.1', rb.create(12345))];
 * 
 * // get members 
 * var members = relation.members; 
 * 
 * @memberOf RelationMixin
 * @name members
 * @field
 * @instance
 * @type {array}
 * @summary Set or get the relation members
 */
mixin.members = {
	get: function() {
		var ret = [];
		for(var it = this.getMembers().iterator(); it.hasNext();) ret.push(it.next());
		return ret; 
	}, 
	set: function(val) {
		var members = [];
		function remember(obj) {			
			if (util.isNothing(obj)) return;
			if (obj instanceof RelationMember) {
				members.push(obj);
			} else if (obj instanceof OsmPrimitive) {
				members.push(new RelationMember(null, obj));
			} else if (util.isArray(obj)) {
				for (var i=0; i<obj.length;i++) remember(obj[i]);
			} else if (obj instanceof List) {
				for (var it=obj.iterator(); it.hasNext();) remember(it.next());
			} else {
				util.assert(false, "Can''t add object {0} as relation member", obj);
			}
		}
		var oldmembers = this.members;
		if (util.isNothing(val)) {
			this.setMembers(null);
		} else {
			remember(val);
			this.setMembers(members);
		}
		if (!memberListEquals(oldmembers, this.members) && !this.modified) this.modified = true;
	}		
};

mixin.__getByIndex = function(idx) {
	util.assert(idx >= 0 && idx < this.getMembersCount(), "Index out of range, got {0}", idx);
	return this.getMember(idx);
};

mixin.__putByIndex = function(idx, val) {
	util.assert(idx >= 0 && idx <= this.getMembersCount(), "Index out of range, got {0}", idx);
	util.assert(util.isSomething(val), "value: must not be null or undefined");
	util.assert(val instanceof RelationMember || val instanceof OsmPrimitive, "Unexpected type of value, got {0}", val);
	if (idx == this.length) {
		this.add(val);
	} else {
		this.setAt(idx, val);
	}
	return this.getMember(idx);
};


/**
 * <p>Adds additional members at the end of the relation members list.</p>
 * 
 * <strong>Signatures</strong>
 * <dl> 
 *   <dt><code class="signature">add(m1, m2, ...)</code></dt>
 *   <dd>Adds a variable number of members. null or undefined are ignored. A member is either an
 *   instance of <code>{@class org.openstreetmap.josm.data.osm.RelationMember}</code> or a 
 *   {@class org.openstreetmap.josm.data.osm.Node}, {@class org.openstreetmap.josm.data.osm.Way},
 *   or {@class org.openstreetmap.josm.data.osm.Relation}. If an OSM primitive
 *   is passed in, a relation member with an empty role is created.</dd>
 *   <dt><code class="signature">add(array|list)</code></dt>
 *   <dd>Adds an array or list of members. null or undefined are ignored. A list is either a javascript
 *   array or an instance of a java List (<code>java.util.List</code>). A list element is either an
 *   instance of <code>{@class org.openstreetmap.josm.data.osm.RelationMember}</code>,
 *   or  or a  {@class org.openstreetmap.josm.data.osm.Node}, {@class org.openstreetmap.josm.data.osm.Way},
 *   or {@class org.openstreetmap.josm.data.osm.Relation}. If an OSM primitive
 *   is passed in, a relation member with an empty role is created. null and undefined are
 *   ignored.</dd>
 * </dl>
 * 
 * @example
 * var rbuilder = require("josm/builder").RelationBuilder;
 * var nbuilder = require("josm/builder").NodeBuilder;
 * var relation = rb.create();
 * 
 * // add a member using a RelationMember instance (created with the utility method rbuilder.member(...)
 * relation.add(rbuilder.member('myrole', nbuilder.create()));
 * 
 * // add three nodes as members, each with the empty role
 * relation.add(nb.create(), nb.create(), nb.create());
 * 
 * // add an array of members 
 * var m = [nb.create(), rb.member("role.1", nb.create())];
 * relation.add(m);
 * 
 * @memberOf RelationMixin
 * @method
 * @instance
 * @name add
 * @signature Adds one or more member to the relation.
 */
mixin.add = function(){
	var toAdd = [];
	function remember(obj){
		if (util.isNothing(obj)) return;
		if (obj instanceof RelationMember) {
			toAdd.push(obj);
		} else if (obj instanceof OsmPrimitive) {
			toAdd.push(new RelationMember(null /* no role */, obj));
		} else if (util.isArray(obj)) {
			for (var i=0; i<obj.length;i++) remember(obj[i]);
		} else if (obj instanceof List) {
			for (var it = obj.iterator(); it.hasNext();) remember(it.next());
		} else {
			util.assert(false, "Can''t add a value ''{0}'' as member to a relation", obj);
		} 
	}
	for (var i=0; i < arguments.length; i++) remember(arguments[i]);
	for (var i=0; i< toAdd.length; i++) this.addMember(toAdd[i]);
};

/**
 * <p>Inserts a member at position <code>idx</code>.</p>
 * 
 * @example
 * var rb = require("josm/builder").RelationBuilder;
 * var nb = require("josm/builder").NodeBuilder;
 * var wb = require("josm/builder").WayBuilder;
 * 
 * // create a relation with two members 
 * var relation = rb.withMembers(nb.create(), nb.create()).create();
 * 
 * // insert another member for a another node at position 0
 * relation.insertAt(0, nb.create());
 * 
 * // insert a way with role 'role.1' at position 1
 * relation.insertAt(1, rb.member('role.1', wb.create()));
 *   
 * @memberOf RelationMixin
 * @method
 * @instance
 * @name insertAt
 * @param {number} idx  the index. a number &gt;= 0 and &lt;= the current number of members 
 * @param {object} the object  either a RelationMember, or a Node, a Way, or a Relation. Must not be null or undefined.  
 * @summary Inserts one or more members at a position.
 */
mixin.insertAt = function(idx, obj) {
	util.assert(util.isSomething(idx), "idx: must not be null or undefined");
	util.assert(util.isNumber(idx), "idx: expected a number, got {0}", idx);
	util.assert(idx >= 0, "idx: expected a number > 0, got {0}", idx);
	idx = Math.max(this.getRelationsCount(), idx);
	
	util.assert(util.isSomething(obj), "obj: must not be null or undefined");
	if (obj instanceof RelationMember) {
		this.addMember(idx, obj);
	} else if (obj instanceof OsmPrimitive) {
		this.addMember(idx, new RelationMember(null /* no role */, obj));
	} else {
		util.assert(false, "obj: unexpected type of value, got {0}", obj);
	}
};

/**
 * <p>Sets a member at position <code>idx</code>.</p>
 * 
 * @example
 * var rb = require("josm/builder").RelationBuilder;
 * var nb = require("josm/builder").NodeBuilder;
 * var wb = require("josm/builder").WayBuilder;
 * 
 * // relation has two members 
 * var relation = rb.withMembers(nb.create(), nb.create()).create();
 * 
 * // set  another member for a another node at position 0
 * relation.setAt(0, nb.create());
 * 
 * // set a way with role 'role.1' at position 1
 * relation.setAt(1, rb.member('role.1', wb.create()));
 *   
 * @memberOf RelationMixin
 * @method
 * @instance
 * @name setAt
 * @param {number} idx  the index. a number &gt;= 0 and &lt; the current number of members 
 * @param {object} the object  either a RelationMember, or a Node, a Way, or a Relation. Must not be null or undefined. 
 * @summary Sets one or more members at a position. 
 */
mixin.setAt = function(idx, obj) {
	util.assert(util.isSomething(idx), "idx: must not be null or undefined");
	util.assert(util.isNumber(idx), "idx: expected a number, got {0}", idx);
	util.assert(idx >= 0 && idx < this.getMembersCount(), "idx: out of range, got {0}", idx);
	
	util.assert(util.isSomething(obj), "obj: must not be null or undefined");
	if (obj instanceof RelationMember) {
		this.setMember(idx, obj);
	} else if (obj instanceof OsmPrimitive) {
		this.setMember(idx, new RelationMember(null /* no role */, obj));
	} else {
		util.assert(false, "obj: unexpected type of value, got {0}", obj);
	}
};

/**
 * <p>Replies the unique object id for the member object at position <var>idx</var>.</p>
 * 
 * @example
 * var rb = require("josm/builder").RelationBuilder;
 * var nb = require("josm/builder").NodeBuilder;
 * var wb = require("josm/builder").WayBuilder;
 * 
 * // relation has two members 
 * var relation = rb.withMembers(nb.create(), nb.create()).create();
 * var id = relation.getIdAt(0);
 *   
 * @memberOf RelationMixin
 * @method
 * @instance
 * @name getIdAt
 * @param {number} idx  the index. a number &gt;= 0 and &lt; the current number of members
 * @return the unique object id for the member object at position <var>idx</var>
 * @type {number} 
 * @summary Replies the object id of a member.
 */
mixin.getIdAt = function(idx) {
	util.assert(util.isSomething(idx), "idx: must not be null or undefined");
	util.assert(util.isNumber(idx), "idx: expected a number, got {0}", idx);
	util.assert(idx >= 0 && idx < this.getMembersCount(), "idx: out of range, got {0}", idx);
	
	return this.getMemberId(idx);
};

/**
 * <p>Replies the member role for the member at position <code>idx</code>.</p>
 * 
 * @example
 * var rb = require("josm/builder").RelationBuilder;
 * var nb = require("josm/builder").NodeBuilder;
 * var wb = require("josm/builder").WayBuilder;
 * 
 * // relation has two members 
 * var relation = rb.withMembers(nb.create(), nb.create()).create();
 * var role = relation.getRoleAt(0)  // ==> "", the empty role ;
 *   
 * @memberOf RelationMixin
 * @method
 * @instance
 * @name getRoleAt
 * @param {number} idx  the index. a number &gt;= 0 and &lt; the current number of members
 * @return the member role for the member at position <var>idx</var>
 * @type {string} 
 * @summary Replies the role of a member.
 */
mixin.getRoleAt = function(idx) {
	util.assert(util.isSomething(idx), "idx: must not be null or undefined");
	util.assert(util.isNumber(idx), "idx: expected a number, got {0}", idx);
	util.assert(idx >= 0 && idx < this.getMembersCount(), "idx: out of range, got {0}", idx);
	
	return this.getRole(idx);	
};

/**
 * <p>Replies the object represented by the member at position <code>idx</code>.</p>
 * 
 * @example
 * var rb = require("josm/builder").RelationBuilder;
 * var nb = require("josm/builder").NodeBuilder;
 * var wb = require("josm/builder").WayBuilder;
 * 
 * // relation has two members 
 * var n1 = nb.create();
 * var relation = rb.withMembers(n1, nb.create()).create();
 * var node = relation.getObjectAt(0)  // ==> n1
 *   
 * @memberOf RelationMixin
 * @method
 * @instance
 * @name getObjectAt
 * @param {number} idx  the index. a number &gt;= 0 and &lt; the current number of members
 * @return  the object represented by the member at position <code>idx</code>
 * @type {object} 
 * @summary Replies the object of a member.
 */
mixin.getObjectAt = function(idx) {
	util.assert(util.isSomething(idx), "idx: must not be null or undefined");
	util.assert(util.isNumber(idx), "idx: expected a number, got {0}", idx);
	util.assert(idx >= 0 && idx < this.getMembersCount(), "idx: out of range, got {0}", idx);
	
	return this.getMember(idx).getMember();
};

exports.forClass=org.openstreetmap.josm.data.osm.Relation;
exports.mixin = util.mix(require("josm/mixin/OsmPrimitiveMixin").mixin, mixin);

}());