<template>
  <div>
    <edge-element
      :selectable="selectable"
      :movable="movable"
      :deletable="deletable"
      connectable
      :id.sync="value.relationView.id"
      :vertices.sync="vertices"
      :from.sync="value.from"
      :to.sync="value.to"
      :_style="style_"
      :label="value.name"
      v-on:selectShape="selectedActivity"
      v-on:deSelectShape="deSelectedActivity"
      v-on:dblclick="openPanel"
      :customMoveActionExist="canvas.isCustomMoveExist"
      v-on:customRelationMoveAction="delayedRelationMove"
      v-on:removeShape="onRemoveShape"
      :image.sync="refreshedImg"
    >
      <sub-elements>
        <text-element
          :sub-width="'100%'"
          :sub-height="25"
          :sub-top="5"
          :text="''"
        >
        </text-element>
      </sub-elements>
    </edge-element>

    <class-relation-panel
      v-if="propertyPanel"
      v-model="value"
      :readOnly="!isEditElement"
      :newEditUserImg="newEditUserImg"
      :image="image"
      :validationLists="filteredElementValidationResults"
      @close="closePanel"
      @changedPanelValue="changedPanelValue"
    ></class-relation-panel>
  </div>
</template>

<script>
import ClassRelationPanel from "../../es-modeling/panels/ClassRelationPanel";
import ClassRelation from "../../es-modeling/elements/ClassRelation";
import ImageElement from "../../../opengraph/shape/ImageElement";
import SubElements from "../../../opengraph/shape/SubElements";
import TextElement from "../../../opengraph/shape/TextElement";
import getParent from '../../../../utils/getParent'

export default {
  components: { TextElement, SubElements, ImageElement, ClassRelationPanel },
  mixins: [ClassRelation],
  name: "class-relation-cm",
  props: {
    value: Object,
  },
  data: function () {
    return {
      name: "",
      oldName: "",
      isView: false,
    };
  },
  created: function () {
    // this.image ='https://raw.githubusercontent.com/kimsanghoon1/k8s-UI/master/public/static/image/event/relation.png'
  },
  computed: {
    defaultStyle() {
      return {};
    },
    className() {
      return "org.uengine.modeling.model.Relation";
    },
    style_() {
      var style = {};
      if (!this.value.name) this.value.name = "";

      return style;
    },
    createNew(canvas, elementId, from, to, vertices) {
      return {
        _type: "org.uengine.modeling.model.Relation",
        name: "",
        id: elementId,
        sourceElement: from,
        targetElement: to,
        from: from.elementView.id,
        to: to.elementView.id,
        relationView: {
          id: elementId,
          style: JSON.stringify({
            "arrow-start": "none",
            "arrow-end": "none",
          }),
          value: vertices,
          from: from.elementView.id,
          to: to.elementView.id,
          needReconnect: true,
        },
        hexagonalView: {
          _type: "org.uengine.modeling.model.RelationHexagonal",
          id: elementId,
          style: JSON.stringify({
            "arrow-start": "none",
            "arrow-end": "none",
          }),
          value: null,
          from: from.elementView.id,
          to: to.elementView.id,
          needReconnect: true,
        },
        sourceMultiplicity: 1,
        targetMultiplicity: 1,
      };
    },
    vertices: {
      get: function () {
        var style;
        try {
          if (this.canvas.isHexagonal) {
            return JSON.parse(this.value.hexagonalView.value);
          } else {
            return JSON.parse(this.value.relationView.value);
          }
        } catch (e) {
          return null;
        }
      },
      set: function (val) {
        if (this.canvas.isHexagonal) {
          this.value.hexagonalView.value = JSON.stringify(val);
        } else {
          this.value.relationView.value = JSON.stringify(val);
        }
      },
    },
  },
  methods: {
    onMoveAction() {},
    setElementCanvas(){
      var me = this
      me.canvas = getParent(me.$parent, "context-mapping-model-canvas");
      me.modelCanvasComponent = me.canvas
    },
    validate(executeRelateToValidate, panelValue) {
      // var me = this;
      // var executeValidate = executeRelateToValidate == false ? false : true;
      // var validateValue = me.propertyPanel && panelValue ? panelValue : me.value;
      //
      // var sourceId = me.value.from;
      // var source = me.value.sourceElement;
      // var target = me.value.targetElement;
    },
  },
};
</script>

<style scoped lang="scss" rel="stylesheet/scss">
.panel-title {
  font-size: 25px;
  color: #757575;
}
</style>
