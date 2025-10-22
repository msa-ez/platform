const CommandReadModelExtractor = require('./CommandReadModelExtractor');
const TextChunker = require("./TextChunker");
const { TextTraceUtil, XmlUtil, RefsTraceUtil } = require("./utils");
const { ChunkIterator } = require("./iterators");

class RecursiveCommandReadModelExtractor extends CommandReadModelExtractor {
    constructor(client) {
        super(client);
        this.textChunker = new TextChunker({
            chunkSize: 25000,
            spareSize: 2000
        });
        this.generatorName = 'RecursiveCommandReadModelExtractor';

        this._init();
    }

    _init(requirementsText) {
        if(requirementsText) {
            this.chunkIterator = new ChunkIterator(this.textChunker, requirementsText)
        }

        this.generatedResults = [];
        this.accumulated = {
            boundedContexts: []
        };
        this.isProcessing = true;
    }


    async generateRecursively(requirementsText) {
        try {

            this._init(requirementsText);
            return new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                this._processNextChunk();
            });
        } catch (error) {
            console.error('[!] RecursiveCommandReadModelExtractor error:', error);
            return {
                extractedData: { boundedContexts: [] },
                currentGeneratedLength: 0
            };
        }
    }

    _processNextChunk() {
        // 최종적인 결과 반환
        if (!this._moveToNextChunk()) {
            this.isProcessing = false;
            this.resolve({
                extractedData: this.accumulated,
                currentGeneratedLength: JSON.stringify(this.accumulated).length
            });
            return;
        }

        this.client.input.requirements = this.chunkIterator.getCurrentChunkText();
        this.client.input.additional_requirements = this._createAdditionalRequirementsPrompt();;  

        this.generate().then(returnObj => {
            this._handleGenerationFinished(returnObj.modelValue.output);
        }).catch(error => {
            console.error('Chunk processing error:', error);
            setTimeout(() => this._processNextChunk(), 100);
        });
    }

    _moveToNextChunk() {
        const hasMoreChunks = this.chunkIterator.hasMoreChunks();
        if (!hasMoreChunks) {
            return false;
        }
        
        this.chunkIterator.moveToNextChunk();
        this.updateProgress();
        return true;
    }

    _createAdditionalRequirementsPrompt() {
        const accumulatedSummary = this._createAccumulatedSummary();
        
        return `<instruction>
    <recursive_extraction_task>
        <title>Incremental Command and ReadModel Extraction - New Items Only</title>
        <task_description>Extract ONLY NEW Commands and ReadModels from the current requirements chunk that are NOT already present in the previously accumulated results. The system will handle merging automatically.</task_description>

        <task_objectives>
            <title>Task Objectives</title>
            <objective id="1">
                <name>Extract ONLY New Operations from Current Chunk</name>
                <description>Identify and extract ONLY NEW Commands and ReadModels from the current requirements chunk that are NOT already in previous results</description>
            </objective>
            <objective id="2">
                <name>Avoid Duplicates</name>
                <description>DO NOT return any Commands or ReadModels that already exist in the previously accumulated results</description>
            </objective>
            <objective id="3">
                <name>Maintain Bounded Context Categorization</name>
                <description>Ensure all extracted items are properly assigned to their appropriate Bounded Context</description>
            </objective>
            <objective id="4">
                <name>Include Source Tracking</name>
                <description>Add refs metadata to each extracted Command and ReadModel for traceability to source requirements</description>
            </objective>
            <objective id="5">
                <name>System Handles Merging</name>
                <description>The merging of new results with previous results is handled automatically by the system - you only provide new items</description>
            </objective>
        </task_objectives>

        <extraction_guidelines>
            <title>Recursive Extraction Guidelines</title>
            
            <guideline id="1">
                <name>Extract ONLY New Operations</name>
                <description>Extract ONLY operations that are NOT already present in the previous summary</description>
                <critical_instruction>DO NOT return any Commands or ReadModels that are already listed in the "Previously Accumulated Results" section below</critical_instruction>
                <rationale>The merging logic is handled by the system - you must return only newly discovered operations from the current chunk</rationale>
            </guideline>
            
            <guideline id="2">
                <name>Naming Consistency</name>
                <description>Maintain consistency with naming conventions established in previous extractions</description>
                <details>
                    <item>Use the same naming patterns (PascalCase, Verb+Noun for Commands, Noun+Purpose for ReadModels)</item>
                    <item>Align with existing terminology and domain language</item>
                </details>
            </guideline>
            
            <guideline id="3">
                <name>Bounded Context Alignment</name>
                <description>Ensure proper Bounded Context assignment consistent with previous extractions</description>
                <details>
                    <item>Assign to the same Bounded Context if the operation belongs to the same domain area</item>
                    <item>Maintain aggregate alignment within each Bounded Context</item>
                </details>
            </guideline>
            
            <guideline id="4">
                <name>Output Format Consistency</name>
                <description>Use the exact same JSON output format as the base CommandReadModelExtractor</description>
                <format_reference>Follow the extractedData structure with boundedContexts array containing commands and readModels</format_reference>
            </guideline>
            
            <guideline id="5">
                <name>Source Tracking Metadata</name>
                <description>Every extracted Command and ReadModel must include refs array for traceability</description>
                <refs_format>Use format [[[startLineNumber, "minimal_start_phrase"], [endLineNumber, "minimal_end_phrase"]]]</refs_format>
            </guideline>
        </extraction_guidelines>

        <duplicate_avoidance_rules>
            <title>Duplicate Avoidance Rules</title>
            <critical_rule>You must EXCLUDE any Commands or ReadModels that match the following criteria with items in "Previously Accumulated Results":</critical_rule>
            
            <rule id="1">
                <name>Name Matching</name>
                <description>Skip if Command/ReadModel name already exists (case-sensitive comparison)</description>
            </rule>
            
            <rule id="2">
                <name>Bounded Context Matching</name>
                <description>Skip if the same name exists within the same Bounded Context</description>
            </rule>
            
            <rule id="3">
                <name>Functional Equivalence</name>
                <description>Skip if functionally equivalent operation already exists, even with slightly different naming</description>
            </rule>
            
            <rule id="4">
                <name>Return Empty Arrays if No New Items</name>
                <description>If no new operations are found in the current chunk, return empty commands and readModels arrays for each bounded context</description>
            </rule>
        </duplicate_avoidance_rules>

        <output_requirements>
            <title>Output Requirements</title>
            <critical_requirement>⚠️ IMPORTANT: Return ONLY NEW items discovered in the current chunk. DO NOT include items already in "Previously Accumulated Results"</critical_requirement>
            <requirement id="1">Return ONLY valid JSON output, no explanations or additional text</requirement>
            <requirement id="2">Use the exact same structure as the base CommandReadModelExtractor output</requirement>
            <requirement id="3">Return ONLY NEW Commands and ReadModels found in the current chunk that are NOT in the previous accumulated results</requirement>
            <requirement id="4">The system will automatically merge your new results with previous results - you must not duplicate existing items</requirement>
            <requirement id="5">Ensure all commands and readModels have required fields: name, actor, aggregate, description, refs</requirement>
            <requirement id="6">Maintain proper JSON formatting and syntax</requirement>
            <requirement id="7">If no new items are found, return empty arrays for commands and readModels</requirement>
        </output_requirements>

        <previous_extracted_data_summary>
            <title>Previously Accumulated Results - DO NOT RETURN THESE AGAIN</title>
            <warning>⚠️ The items listed below have ALREADY been extracted and processed. DO NOT include them in your output.</warning>
            <description>The following Commands and ReadModels were already extracted from previous requirement chunks and must be EXCLUDED from your current extraction:</description>
            <exclusion_list>
${accumulatedSummary}
            </exclusion_list>
            <reminder>Extract ONLY new operations from the current chunk that are NOT listed above</reminder>
        </previous_extracted_data_summary>
    </recursive_extraction_task>
</instruction>`;
    }

    _createAccumulatedSummary() {
        if (!this.accumulated.boundedContexts || this.accumulated.boundedContexts.length === 0) {
            return "No previous data available.";
        }

        const summaryData = []
        for(const bc of this.accumulated.boundedContexts) {
            const commandNames = bc.commands ? bc.commands.map(cmd => cmd.name) : [];
            const readModelNames = bc.readModels ? bc.readModels.map(rm => rm.name) : [];
            summaryData.push({
                boundedContextName: bc.name,
                commands: commandNames,
                readModels: readModelNames
            });
        }
        return XmlUtil.from_dict(summaryData);
    }

    
    _handleGenerationFinished(model) {
        try {
            if (model && model.extractedData && model.extractedData.boundedContexts) {
                this.generatedResults.push(model);
                this.accumulated = this._mergeExtractedData(this.accumulated, model.extractedData);
            }
        } catch (error) {
            console.error('Error handling generation finished:', error);
        }

        setTimeout(() => this._processNextChunk(), 100);
    }

    _mergeExtractedData(existingData, newData) {
        if (!existingData || !existingData.boundedContexts) {
            return newData;
        }

        const mergedBoundedContexts = [...existingData.boundedContexts];
        for(const newBC of newData.boundedContexts) {
            const existingBCIndex = mergedBoundedContexts.findIndex(
                bc => bc.name === newBC.name
            );
            if(existingBCIndex === -1) {
                mergedBoundedContexts.push(newBC);
                continue;
            }

            const existingCommands = mergedBoundedContexts[existingBCIndex].commands || [];
            const newCommands = (newBC.commands || []).filter(newCmd => 
                !existingCommands.some(existingCmd => 
                    existingCmd.name === newCmd.name
                )
            );
            mergedBoundedContexts[existingBCIndex].commands = [
                ...existingCommands,
                ...newCommands
            ];

            const existingReadModels = mergedBoundedContexts[existingBCIndex].readModels || [];
            const newReadModels = (newBC.readModels || []).filter(newRm => 
                !existingReadModels.some(existingRm => 
                    existingRm.name === newRm.name
                )
            );
            mergedBoundedContexts[existingBCIndex].readModels = [
                ...existingReadModels,
                ...newReadModels
            ];
        }

        return {
            ...existingData,
            boundedContexts: mergedBoundedContexts
        };
    }


    _getLineNumberedRequirements() {
        return TextTraceUtil.addLineNumbers(
            this.chunkIterator.getCurrentChunkText(), this.chunkIterator.getCurrentChunkStartLine(), true
        );
    }

    _validateRefs(extractedData, requirements) {
        RefsTraceUtil.validateRefs(
            extractedData, 
            requirements,
            this.chunkIterator.getCurrentChunkStartLine() - 1
        );
    }


    updateProgress() {
        if (this.client && this.client.updateMessageState) {
            const currentChunkIndex = Math.max(this.chunkIterator.getCurrentChunkIndex(), 0);
            const progress = Math.round((currentChunkIndex / this.chunkIterator.getTotalChunks()) * 100);
            const siteMapViewerMessage = this.client.messages.find(msg => msg.type === 'siteMapViewer');
            const messageId = siteMapViewerMessage ? siteMapViewerMessage.uniqueId : null;
            
            if (messageId) {
                this.client.updateMessageState(messageId, {
                    processingRate: progress,
                    currentChunk: currentChunkIndex + 1,
                    totalChunks: this.chunkIterator.getTotalChunks(),
                    currentProcessingStep: 'extractingCommandsAndReadModels'
                });
            }
        }
    }
}

module.exports = RecursiveCommandReadModelExtractor;
