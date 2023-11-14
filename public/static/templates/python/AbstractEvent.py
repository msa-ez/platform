from datetime import datetime

import KafkaProcessor

class AbstractEvent:
	eventType : str
	timeStamp : str

	def __init__(self):
		self.eventType = self.__class__.__name__
		self.timeStamp = str(datetime.now())

	def ToJson(self):
		return self.__dict__

	def Publish(self):
		msg = self.ToJson()

		processor = KafkaProcessor.streamhandler
		processor.produce(msg)