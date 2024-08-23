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
      :label.sync="namePanel"
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
            'stroke-width': 3,
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
            'stroke-width': 3,
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
        <rectangle-element
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

      <sub-elements>
        <image-element
          v-for="index in newEditUserImg.length"
          :key="index"
          v-bind:image="newEditUserImg[index - 1].picture"
          :sub-width="'24px'"
          :sub-height="'24px'"
          :sub-right="10 * (index - 1) + 'px'"
          :sub-bottom="value.elementView.height"
        ></image-element>
      </sub-elements>

      <sub-controller
        v-if="value.modelValue.projectId"
        :image="'open-in-new.png'"
        @click="openProject"
      ></sub-controller>
    </group-element>

    <pbc-cm-panel
      v-if="propertyPanel"
      v-model="value"
      :isReadOnly="!isEditElement"
      :newEditUserImg="newEditUserImg"
      :image="image"
      :validationLists="filteredElementValidationResults"
      @close="closePanel"
      @changedPanelValue="changedPanelValue"
    ></pbc-cm-panel>
  </div>
</template>

<script>
  import PBC from "../../es-modeling/elements/PBC";
  import PBCCMPanel from "../panels/PBCCMPanel";
  import GroupElement from "../../../opengraph/shape/GroupElement";
  import ImageElement from "../../../opengraph/shape/ImageElement";
  import SubElements from "../../../opengraph/shape/SubElements";
  import StormingSubController from "../../modeling/StormingSubController";
  import getParent from '../../../../utils/getParent'

  export default {
    name: "packaged-business-capabilities-cm",
    mixins: [PBC],
    components: {
      SubElements,
      ImageElement,
      GroupElement,
      "pbc-cm-panel": PBCCMPanel,
      "storming-sub-controller": StormingSubController,
    },
    props: {},
    computed: {
      innerAggregate(){
        if(this.value && this.value.aggregates){
          return this.value.aggregates
        }
        return [];
      },
      defaultStyle() {
        return {};
      },
      className() {
        return "org.uengine.modeling.model.PBC";
      },
      createNew(canvas, elementId, x, y, width, height, description, label) {
        return {
          _type: "org.uengine.modeling.model.PBC",
          id: elementId,
          name: "PBC" + x,
          description: null,
          author: null,
          boundedContextes: [],
          aggregates: [],
          events: [],
          commands: [],
          policies: [],
          views: [],
          modelValue: {},
          elementView: {
            _type: "org.uengine.modeling.model.PBC",
            id: elementId,
            x: x,
            y: y,
            width: 250,
            height: 300,
            style: JSON.stringify({}),
          },
          hexagonalView: {
            _type: "org.uengine.modeling.model.PBCHexagonal",
            id: elementId,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            style: JSON.stringify({}),
          },
          relations: [],
        };
      },
    },
    data: function () {
      return {
      };
    },
    watch: {},
    methods: {
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
      onMoveAction() {},
      validate(executeRelateToValidate, panelValue) {
        // onCreate, onMove
        // me.elementValidationResults.splice(validationResultIndex, 1)
      },
      drawPBCModeling(){

      },
    },
};
</script>


