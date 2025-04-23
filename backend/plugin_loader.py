# plugin_loader.py
from semantic_kernel import import_functions_from_object
from functions import LedgerService, RecordService, NotificationService, DatabaseClient

def load_all_plugins(kernel):
    plugins = []

    # 用同一个 DatabaseClient 实例
    db_client = DatabaseClient()

    # 分别导入三个服务的 plugin
    plugins.extend(import_functions_from_object(LedgerService(db_client)))
    plugins.extend(import_functions_from_object(RecordService(db_client)))
    plugins.extend(import_functions_from_object(NotificationService(db_client)))

    return plugins