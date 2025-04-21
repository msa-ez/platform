const state = {
  isAiSettingsRequired: false,
  aiSettingsErrorMessage: '',
};

const mutations = {
  SET_AI_SETTINGS_REQUIRED(state, isRequired) {
    state.isAiSettingsRequired = isRequired;
  },
  SET_AI_SETTINGS_ERROR_MESSAGE(state, message) {
    state.aiSettingsErrorMessage = message;
  },
};

const actions = {
  checkAiModelSettings({ commit }) {
    const thinkingModel = localStorage.getItem('thinkingModel');
    const normalModel = localStorage.getItem('normalModel');
    
    if (!thinkingModel && !normalModel) {
      commit('SET_AI_SETTINGS_REQUIRED', true);
      commit('SET_AI_SETTINGS_ERROR_MESSAGE', 'Please select the AI model to use.');
      return true;
    }
    return false;
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
}; 