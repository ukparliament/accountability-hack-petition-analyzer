(function () {
    function transformPetitionsDataForAnalysis() {
        var input; // from data.parliament
        var output = {
            documents: input.result.items.map(function (item) {
                var combinedText = [
                    item.abstract._value,
                    item.label._value,
                    item.description ?
                        item.description[0] :
                        ""
                ].join(" ");

                return {
                    id: item._about,
                    text: combinedText
                };
            })
        };

        var outputJson = JSON.stringify(output);
    }

    function getPetitionList() {
        var crossReferencePetitionsWithTopics = function (petition) {
            var samePetition = function (assignement) {
                return assignement.documentId === petition._about;
            };

            var getTopic = function (assignement) {
                var sameTopic = function (topic) {
                    return topic.id === assignement.topicId;
                };

                var extractKeyphrase = function (topic) {
                    return topic.keyPhrase;
                };

                return outputFromTopicExtraction.operationProcessingResult.topics
                    .filter(sameTopic)
                    .map(extractKeyphrase)[0];
            };

            return {
                label: petition.label._value,
                topics: outputFromTopicExtraction.operationProcessingResult.topicAssignments
                    .filter(samePetition)
                    .map(getTopic)
            }
        };

        return petitionsFromDDP.result.items
            .map(crossReferencePetitionsWithTopics);
    }

    function getTopicList() {
        var crossReferenceTopicsWithPetitions = function (topic) {
            var sameTopic = function (assignement) {
                return assignement.topicId === topic.id;
            };

            var getPetition = function (assignement) {
                var samePetition = function (petition) {
                    return petition._about === assignement.documentId;
                };

                return petitionsFromDDP.result.items
                    .filter(samePetition)[0];
            };

            return {
                name: topic.keyPhrase,
                petitions: outputFromTopicExtraction.operationProcessingResult.topicAssignments
                    .filter(sameTopic)
                    .map(getPetition)
            };
        };

        return outputFromTopicExtraction.operationProcessingResult.topics
            .map(crossReferenceTopicsWithPetitions);
    }

    function onload() {
        console.log(getTopicList());
    }

    window.addEventListener("load", onload);
})();
