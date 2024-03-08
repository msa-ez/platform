<template>
  <div>
    <group-element
      :selectable="selectable"
      :movable="movable"
      :resizable="resizable"
      :deletable="deletable"
      :id.sync="value.elementView.id"
      :x.sync="elementCoordinate.x"
      :y.sync="elementCoordinate.y"
      :width.sync="elementCoordinate.width"
      :height.sync="elementCoordinate.height"
      :customMoveActionExist="canvas.isCustomMoveExist"
      v-on:customMoveAction="delayedMove"
      v-on:moveShape="onMoveShape"
      v-on:removeShape="onRemoveShape"
      v-on:selectShape="selectedActivity"
      v-on:deSelectShape="deSelectedActivity"
      v-on:dblclick="openPanel"
      v-on:addToGroup="onAddToGroup"
      :label.sync="getNamePanel"
      :image.sync="refreshedImg"
      :_style="{
        'vertical-align': 'top',
        'font-weight': 'bold',
        'font-size': '16',
      }"
    >
      <sub-elements>
        <geometry-rect
          v-if="movingElement"
          :_style="{
            'fill-r': 1,
            'fill-cx': 0.1,
            'fill-cy': 0.1,
            'stroke-width': 1.4,
            stroke: '#000000',
            fill: '#e3e1e1',
            'fill-opacity': 0.5,
            'vertical-align': 'top',
            'font-weight': 'bold',
            'font-size': '16',
            r: '1',
          }"
        ></geometry-rect>
        <geometry-rect
          v-else
          :_style="{
            'fill-r': 1,
            'fill-cx': 0.1,
            'fill-cy': 0.1,
            'stroke-width': 1.4,
            stroke: '#000000',
            'fill-opacity': 1,
            'vertical-align': 'top',
            'font-weight': 'bold',
            'font-size': '16',
            r: '1',
          }"
        ></geometry-rect>


      </sub-elements>

      <sub-elements>
        <image-element
                v-if="value.mirrorElement"
                v-bind:image="isProjectConnecting ? link_image : link_off_image"
                :sub-width="'10px'"
                :sub-height="'10px'"
                :sub-left="'3px'"
                :sub-top="'3px'"
        >
        </image-element>

        <rectangle-element
                v-if="innerAggregate"
                v-for="index in innerAggregate.length"
                sub-width="90%"
                sub-left="5%"
                :sub-height="calInnerView(index, innerAggregate.length).height"
                :sub-top="calInnerView(index, innerAggregate.length).top"
                :subStyle="{
                            'stroke': '#F8D454',
                            'fill': '#F8D454',
                            'fill-opacity': 1,
                        }"
                :label.sync="innerAggregate[index - 1].name"
        > </rectangle-element>
      </sub-elements>

      <storming-sub-controller
        :type="value._type"
        :value="value"
        :readOnly="!canvas.isEditable && !isMembers"
        @createDefinition="createDefinition()"
        canvasType="cm"
        :isProjectConnecting="isProjectConnecting"
      ></storming-sub-controller>

      <sub-elements>
        <image-element
          v-for="index in newEditUserImg.length"
          :key="index"
          v-bind:image="newEditUserImg[index - 1].picture"
          :sub-width="'24px'"
          :sub-height="'24px'"
          :sub-right="10 * (index - 1) + 'px'"
          :sub-bottom="elementCoordinate.height"
        ></image-element>
      </sub-elements>
    </group-element>

    <bounded-context-cm-panel
      v-if="propertyPanel"
      v-model="value"
      :readOnly="!isEditElement"
      :newEditUserImg="newEditUserImg"
      :image="image"
      :validationLists="filteredElementValidationResults"
      @close="closePanel"
      @changedPanelValue="changedPanelValue"
      :generateDone.sync="generateDone"
      :generator="generator"
    ></bounded-context-cm-panel>
  </div>
</template>

<script>
  import BoundedContext from "../../es-modeling/elements/BoundedContext";
  import BoundedContextCMPanel from "../panels/BoundedContextCMPanel";
  import GroupElement from "../../../opengraph/shape/GroupElement";
  import ImageElement from "../../../opengraph/shape/ImageElement";
  import SubElements from "../../../opengraph/shape/SubElements";
  import StormingSubController from "../../modeling/StormingSubController";
  import getParent from '../../../../utils/getParent'

  export default {
    name: "bounded-context-cm",
    components: {
      SubElements,
      ImageElement,
      GroupElement,
      "bounded-context-cm-panel": BoundedContextCMPanel,
      "storming-sub-controller": StormingSubController,
    },
    mixins: [BoundedContext],
    computed: {
      resizable(){
        return this.canvas.isEditable && !this.movingElement
      },
      innerAggregate(){
        if(this.canvas && this.canvas.mirrorValue.elements){
          return this.value.aggregates.filter(x=> x && x.id).map(x=> x = this.canvas.mirrorValue.elements[x.id]);
        }
        return [];
      },
      defaultStyle() {
        return {};
      },
      className() {
        return "org.uengine.modeling.model.BoundedContext";
      },
      createNew(canvas, elementId, x, y, width, height, description, label) {
        return {
          _type: "org.uengine.modeling.model.BoundedContext",
          id: elementId,
          name: "BoundedContext" + x,
          oldName: "",
          description: null,
          author: null,
          aggregates: [],
          policies: [],
          members: [],
          views: [],
          gitURL: null,
          mirrorElement: null,
          elementView: {
            _type: "org.uengine.modeling.model.BoundedContext",
            id: elementId,
            x: x,
            y: y,
            width: 250,
            height: 300,
            style: JSON.stringify({}),
          },
          hexagonalView: {
            _type: "org.uengine.modeling.model.BoundedContextHexagonal",
            id: elementId,
            x: x,
            y: y,
            width: 350,
            height: 350,
            style: JSON.stringify({}),
          },
          portGenerated: 0,
          tempId: "",
          templatePerElements: {},
          preferredPlatform: "spring-boot",
          preferredPlatformConf: {},
        };
      },

      input() {
        return {
          description: this.value.description,
          boundedContext: this.value,
        };
      },
    },
    data: function () {
      return {
        itemH: 20,
        titleH: this.value.classReference ? 60 : 30,
        reference: this.value.classReference != null,
        referenceClassName: this.value.classReference,

        // UML Class Diagram
        aggregateRoots: [],
        generateDone: true,
        generator: null,
      };
    },
    watch:{
      "innerAggregate": {
        deep:true,
        handler: function (newVal, oldVal) {
          this.$nextTick(function(){
            this.refreshImg()
          })
        }
      },
      "isProjectConnecting": function () {
        this.refreshImg()
      },
    },
    methods: {
      init(){ },
      createDefinition(){
        var me = this

        me.canvas.storageCondition = {
          action: 'save',
          title: 'Edit BoundedContext',
          comment: '',
          projectName: `${me.canvas.information.associatedProject}-${me.value.name}`,
          projectId: `${me.canvas.information.associatedProject}-${me.value.name}`,
          version: 'v0.0.1',
          error: null,
          loading: false,
          type: 'es',
          associatedProject: me.canvas.information.associatedProject,
          connectedAssociatedProject : me.canvas.information.associatedProject ? true : false,
          element: me.value
        }
        me.canvas.storageDialog = true
      },
      calInnerView(index, len){
        let h = this.value.elementView.height;
        let height = (h*0.5)/len > 25 ? 25 :(h*0.5)/len
        let top = (h*0.01) + (height*index) + (5*index)

        return {
          height: height,
          top: top
        }
      },
      setElementCanvas(){
        var me = this
        me.canvas = getParent(me.$parent, "context-mapping-model-canvas");
      },
      onChangedElementName(newVal, oldVal) {
        this.setMirrorElementId();
      },
      onMoveAction() {},
      setMirrorElementId(){
        var me = this
        // already connected.
        if( me.value.mirrorElement ) return;
        if( !me.value.name) return;

        // 내 자신이 원본인 경우인지
        let isOriginValue = Object.values(me.canvas.mirrorValue.elements)
                .find(ele =>
                        ele
                        && ele._type == me.value._type  // equals type.
                        && ele.id != me.value.elementView.id // myself x
                        && ele.mirrorElement == me.value.elementView.id // connected element before
                )

        if( isOriginValue ) return;

        let equalsElement = Object.values(me.canvas.mirrorValue.elements)
                .find(ele =>
                        ele
                        && ele._type == me.value._type  // equals type.
                        && ele.name
                        && ele.name.toLowerCase() == me.value.name.toLowerCase() // equals name
                        && ele.elementView.id != me.value.elementView.id // myself x
                        && !ele.mirrorElement // connected element x
                        && !me.canvas.value.elements[ele.elementView.id] // mine project
                )

        if( equalsElement ) {
          // input ref
          me.value.mirrorElement = equalsElement.elementView.id;
          me.canvas.syncMirrorElements();
        }
      },
      validate(executeRelateToValidate, panelValue) {
        // var me = this;
        // let executeValidate = executeRelateToValidate == false ? false : true;
        // let validateValue = me.propertyPanel && panelValue ? panelValue : me.value;
      },
    }
  };
</script>

<style scoped lang="scss" rel="stylesheet/scss">
.panel-title {
  font-size: 25px;
  color: #757575;
}
</style>
