<template>
    <div :id="id" class="mermaid">{{ parseCode }}</div>
  </template>
  
  <script>
  import mermaid from "mermaid";
  export default {
    name: "VueMermaid",
    props: {
      id: {
        type: String,
        required: true
      },
      type: {
        type: String,
        default: "graph TD"
      },
      nodes: {
        type: Array,
        required: true
      },
      styles: {
        type: Array,
        default() {
          return [];
        }
      },
      config: {
        type: Object,
        default() {
          return {};
        }
      },
      defaultConfig: {
        type: Object,
        default() {
          return { theme: "default", startOnLoad: false, securityLevel: "loose" };
        }
      },
      stopOnError: {
        type: Boolean,
        default: false
      }
    },
    data: function() {
      return {
        edges: [
          { type: "default", open: "[", close: "]" },
          { type: "round", open: "(", close: ")" },
          { type: "stadium", open: "([", close: "])" },
          { type: "subroutine", open: "[[", close: "]]" },
          { type: "cylindrical", open: "[(", close: ")]" },
          { type: "circle", open: "((", close: "))" },
          { type: "asymetric", open: ">", close: "]" },
          { type: "rhombus", open: "{", close: "}" },
          { type: "hexagon", open: "{{", close: "}}" },
          { type: "parallelogram", open: "[/", close: "/]" },
          { type: "parallelogram_alt", open: "[\\", close: "\\]" },
          { type: "trapezoid", open: "[/", close: "\\]" },
          { type: "trapezoid_alt", open: "[\\", close: "/]" },
        ]
      };
    },
    mounted() {
      this.init();
      this.loadNodes();
    },
    computed: {
      nodeObject() {
        const { nodes } = this;
        if (Array.isArray(nodes) && nodes.length > 0) {
          const arrayToObject = (arr, keyField) =>
            Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })));
          return arrayToObject(nodes, "id");
        } else {
          return {};
        }
      },
      customStyle() {
        const { nodes, styles } = this;
        const nodeStyles = nodes
            .filter(node => node.style)
            .map(node => {
                // CSS 스타일 문자열을 Mermaid 포맷으로 변환
                const mermaidStyle = node.style
                    .split(',')
                    .map(s => s.trim())
                    .join(',');
                return `style ${node.id} ${mermaidStyle}`;
            });
        const nodeLinkStyles = nodes
            .filter(node => node.linkStyle)
            .map(node =>
                `linkStyle ${node.linkNumber || nodes.indexOf(node)} ${node.linkStyle}`
            );
        return nodeStyles.concat(styles).concat(nodeLinkStyles);
      },

      parseCode() {
        const { nodes } = this;
        if (Array.isArray(nodes) && nodes.length > 0) {
            // 1. 다이어그램 타입 정의
            let code = this.type + "\n\n";
            
            // 2. 노드와 관계 정의
            code += this.getGroupNodes(nodes) + "\n\n";
            
            // 3. 스타일 정의
            code += this.customStyle.join("\n");
            
            this.load(code);
            return code;
        }
        return "";
      }
    },
    methods: {
      getGroupNodes(nodes) {
        const innerMap = new Map();
        nodes.forEach(element => {
            const group = element.group || "";
            const data = innerMap.get(group) || { nids: new Set(), narr: [] };
            data.nids.add(element.id);
            data.narr.push(element);
            innerMap.set(group, data);
        });

        // 1. 먼저 모든 subgraph와 노드 정의
        const subgraphs = [...innerMap.entries()]
            .map(([groupName, entry], index) => {
                const { narr } = entry;
                if (groupName !== "") {
                    const nodeStr = narr.map(node => 
                        this.buildNode(node)
                    ).join('\n    '); // 들여쓰기 추가
                    // 공백이 포함된 그룹명을 처리하기 위해 따옴표 사용
                    return `subgraph "${groupName}"\n    ${nodeStr}\nend`;
                }
                return narr.map(node => this.buildNode(node)).join('\n');
            })
            .join('\n\n'); // 그룹 간 간격 추가

        // 2. 그 다음 모든 관계 정의
        const relations = nodes
            .filter(item => item.next && item.next.length > 0)
            .flatMap(item => 
                item.next.map((targetId, index) => 
                    `${item.id}${item.link[index]}${targetId}`
                )
            ).join('\n');

        // 3. 마지막으로 클릭 이벤트
        const clicks = nodes
            .filter(item => item.editable)
            .map(item => `click ${item.id} mermaidClick`)
            .join('\n');

        return `${subgraphs}\n\n${relations}\n\n${clicks}`;
     },
      buildNodesStr(nodes) {
          // 1. 노드 정의
          const nodeDefinitions = nodes.map(item => {
              const edge = this.edges.find(e => e.type === (item.edgeType || 'default'));
              return `${item.id}${edge.open}${item.text}${edge.close}`;
          }).join('\n');

          // 2. 관계 정의 - 각각 독립적인 문장으로
          const relationDefinitions = nodes
              .filter(item => item.next && item.next.length > 0)
              .flatMap(item => 
                  item.next.map((targetId, index) => 
                      `${item.id}${item.link[index]}${targetId}`
                  )
              ).join('\n');

          // 3. 클릭 이벤트
          const clickDefinitions = nodes
              .filter(item => item.editable)
              .map(item => `click ${item.id} mermaidClick`)
              .join('\n');

          return `${nodeDefinitions}\n${relationDefinitions}\n${clickDefinitions}`;
      },
      buildNode(item) {
        let edge = !item.edgeType
          ? this.edges.find(e => {
              return e.type === "default";
            })
          : this.edges.find(e => {
              return e.type === item.edgeType;
            });
        return `${item.id}${edge.open}${item.text}${edge.close}`;
      },
      buildLink(item, index) {
        const link = "-->";
        if (item.link) {
          if (Array.isArray(item.link)) {
            if (item.link.length > index) return item.link[index];
            else return item.link[item.link.length - 1];
          } else {
            return item.link;
          }
        }
        return link;
      },
      loadNodes() {
        this.load(this.parseCode);
      },
      init() {
        const _t = this;
        window.mermaidClick = function(id) {
          _t.edit(id);
        };
        mermaid.initialize(Object.assign(this.defaultConfig, this.config));
      },
      load(code) {
        if (code) {
          var container = document.getElementById(this.id);
          if (container) {
            container.removeAttribute("data-processed");
            container.replaceChild(
              document.createTextNode(code),
              container.firstChild
            );
            try {
              mermaid.init(code, container);
            } catch (error) {
              if (this.stopOnError) {
                throw error;
              }
            }
          }
        }
      },
      edit(id) {
        this.$emit("nodeClick", id);
      }
    }
  };
  </script>
  
  <style></style>
  