<template></template>

<script>
import StorageBase from '../../utils/StorageBase';
const changeCase = require('change-case');

export default {
        name: 'usage-page',
        components: {},
        data() {
            return {
                // common
                storage: null,
                db: null,
                userInfo:{},
                plans: {},

                selectedMonth: null,
                months: [],
                start: {
                    menu: false,
                    date: null,
                },
                end: {
                    menu: false,
                    date: null,
                },
    
            }
        },
        computed:{
          
         
        },
        async created(){
            this.storage = StorageBase.getStorage('firestore')
            this.db = StorageBase.getStorage('firebase')

            this.userInfo = await this.storage.getCurrentUser()
            await this.settingRange()
            this.loadPlans()
            this.loadInitPage()
        },
        methods:{
            loadInitPage(){},
            loadPage(){
                throw new Error('loadPage() must be implement')
            },
            loadRange(){
                throw new Error('loadRange() must be implement')
            }, 
            async loadPlans(){
                this.plans = await this.db.getObject('/plans')
            },
            async settingRange(){
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear();
                const currentMonth = currentDate.getMonth();

                // 현재 달의 시작 타임스탬프와 끝 타임스탬프
                const currentMonthStart = new Date(currentYear, currentMonth, 1);
                const currentMonthEnd = currentDate

                this.months.push({
                    label: 'Current month',
                    startTimeStamp: this.formatDateStringToTimeStamp(currentMonthStart,'start'),
                    endTimeStamp: this.formatDateStringToTimeStamp(currentMonthEnd,'end'),
                });

                for (let i = 1; i <= 6; i++) {
                    const previousMonth = new Date(currentYear, currentMonth - i, 1);
                    const previousMonthEnd = new Date(currentYear, currentMonth - i + 1, 0); // 이전 달의 마지막 날

                    // 월의 이름과 연도 가져오기
                    const monthName = new Intl.DateTimeFormat('en', { month: 'short' }).format(previousMonth);
                    const year = previousMonth.getFullYear();

                    this.months.push({
                        label: `${monthName} ${year}`, // 표시 정보
                        startTimeStamp: this.formatDateStringToTimeStamp(previousMonth,'start'), // 시작 타임스탬프
                        endTimeStamp: this.formatDateStringToTimeStamp(previousMonthEnd,'end'), // 종료 타임스탬프
                    });
                }

                this.months.push({
                    label: 'Custom range',
                    startTimeStamp: this.formatDateStringToTimeStamp(currentMonthStart,'start') ,
                    endTimeStamp: this.formatDateStringToTimeStamp(currentMonthEnd,'start'),
                });

                this.selectedMonth = 'Current month'

                this.start.date = this.formatTimeToYearMonth(currentMonthStart.getTime()).date
                this.end.date = this.formatTimeToYearMonth(currentMonthEnd.getTime()).date
            },     
            changeSelectedMonth(selectedRange){
                let getMonth = this.months.find(x=>x.label == selectedRange)

                this.selectedMonth = selectedRange
                this.start.date  = this.formatTimeToYearMonth(getMonth.startTimeStamp).date
                this.end.date = this.formatTimeToYearMonth(getMonth.endTimeStamp).date

                this.loadRange(getMonth.startTimeStamp, getMonth.endTimeStamp)
            },
            updateSelectedStartDate(startDate){
                let getMonthStartTimeStamp = this.months.find(x=>x.label == this.selectedMonth).startTimeStamp
                if(this.formatTimeToYearMonth(getMonthStartTimeStamp).date != startDate){
                    this.selectedMonth = 'Custom range'
                }
                this.loadRange(this.formatDateStringToTimeStamp(startDate, 'start'), this.formatDateStringToTimeStamp(this.end.date, 'end'))
                this.start.menu = false
            },
            updateSelectedEndDate(endDate){
                let getMonthEndTimeStamp = this.months.find(x=>x.label == this.selectedMonth).endTimeStamp
                if(this.formatTimeToYearMonth(getMonthEndTimeStamp).date != endDate){
                    this.selectedMonth = 'Custom range'
                }
                this.loadRange(this.formatDateStringToTimeStamp(this.start.date, 'start'), this.formatDateStringToTimeStamp(endDate, 'end'));
                this.end.menu = false
            },

            formatServiceType(serviceType) {
                const [first, second] = serviceType.split('_');
                if (first && second) {
                    if(this.formatCanvasType(first)){
                        return {
                            title: changeCase.pascalCase(second),
                            detail: this.formatCanvasType(first)
                        }
                    } else {
                        return {
                            title: changeCase.pascalCase(first),
                            detail: null
                        }
                    }
                } 
                return serviceType;
            },
            formatMetadata(value) {
                var me = this
                let title = ''
                let detail = ''
                let metadata = value.metadata

                if(value.serviceType.includes('codeArchive')){
                    title = metadata['modelId']
                    detail = `Model name: ${metadata['modelName']}`
                } else if(value.serviceType.includes('AIGeneration')) {
                    title = metadata['modelId']
                    detail = `${me.formatCanvasUrl('project')}/${metadata['projectId']}`
                }

                return {title: title, detail: detail};
            },
            formatMeasurement(rowInfo) {
                let usedPlan = this.plans[rowInfo.plan]
                if(!usedPlan) return rowInfo.measurement
                if(!usedPlan[rowInfo.serviceType]) return rowInfo.measurement

                if(usedPlan[rowInfo.serviceType].billingType == 'ONCE') return `Once`
                if(usedPlan[rowInfo.serviceType].UOM) return `${rowInfo.measurement} ${usedPlan[rowInfo.serviceType].UOM}`

                return rowInfo.measurement;
            },
            formatDate(timestamp) {
                return new Date(timestamp).toLocaleString();
            },
        

            formatTimeToYearMonth(time) {
                const date = new Date(time);
                const year = date.getFullYear().toString();
                const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 +1, 두 자리로 패딩
                const day = date.getDate().toString().padStart(2, '0'); // 두 자리로 패딩

                return {'year': year, 'month': month, 'day': day, 'yearMonth': `${year}${month}`, 'date': `${year}-${month}-${day}`} ;
            },
            formatDateStringToTimeStamp(date, type){
                const dateString = new Date(date);
                let dateObject = new Date(dateString.getFullYear(), dateString.getMonth(), dateString.getDate());
                if(type == 'start'){
                    dateObject = new Date(dateString.getFullYear(), dateString.getMonth(), dateString.getDate(), 0, 0, 0, 0);
                } else if(type == 'end'){
                    dateObject = new Date(dateString.getFullYear(), dateString.getMonth(), dateString.getDate(), 23, 59, 59, 999);
                } 
                return dateObject.getTime();
            },
            
            formatCanvasType(type){
                if(!type) return null;
                type = type.toLowerCase()

                if(type == 'es') return "EventStorming"
                else if(type == 'k8s') return "Kubernetes"
                else if(type == 'bm') return "Business Model"
                else if(type == 'cjm') return "Customer Journey Map"
                else if(type == 'sticky') return "Sticky Note"
                else if(type == 'bpmn') return "Business Process"
                else if(type == 'uml') return "UML"
                else if(type == 'project') return "Project"
                else if(type == 'cm') return "Context Mapping"
    
                return null;
            },
            formatCanvasUrl(type){
                if(!type) return null;
                type = type.toLowerCase()

                if(type == 'es') return "storming"
                else if(type == 'k8s') return "kubernetes"
                else if(type == 'bm') return "business-model-canvas"
                else if(type == 'cjm') return "cjm"
                else if(type == 'sticky') return "sticky"
                else if(type == 'bpmn') return "bpmn"
                else if(type == 'uml') return "uml"
                else if(type == 'project') return "project"
                else if(type == 'cm') return "cm"
    
                return type
            },
        }
    }
</script>
