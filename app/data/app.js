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

                var aggregateSignatures = function (petition) {
                    petition.numberOfSignatures = petition.votingByConstituency.reduce(function (accumulator, voting) {
                        return accumulator + voting.numberOfSignatures
                    }, 0);

                    return petition;
                }

                return petitionsFromDDP.result.items
                    .filter(samePetition)
                    .map(aggregateSignatures)[0];
            };

            return {
                name: topic.keyPhrase,
                topicId: topic.id,
                score: topic.score,
                petitions: outputFromTopicExtraction.operationProcessingResult.topicAssignments
                    .filter(sameTopic)
                    .map(getPetition)
                    .sort(function (a, b) {
                        return b.numberOfSignatures - a.numberOfSignatures;
                    })
            };
        };

        return outputFromTopicExtraction.operationProcessingResult.topics
            .map(crossReferenceTopicsWithPetitions)
            .sort(function (a, b) { return b.score - a.score; });
    }

    window.data = getTopicList();
})();
