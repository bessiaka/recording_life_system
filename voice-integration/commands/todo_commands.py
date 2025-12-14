"""
Голосовые команды для управления задачами
"""
import requests
import logging
import re
from typing import Optional

# Эти импорты должны быть из твоего voice-app
# from commands.base import BaseCommand, CommandResult

logger = logging.getLogger(__name__)


class TodoCommandBase:
    """Базовый класс для TODO команд"""
    
    def __init__(self, api_url: str = "http://localhost:8000"):
        self.api_url = api_url
    
    def _make_request(self, method: str, endpoint: str, **kwargs):
        """Выполнить HTTP запрос к API"""
        url = f"{self.api_url}{endpoint}"
        try:
            response = requests.request(method, url, timeout=5, **kwargs)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            logger.error(f"Ошибка запроса к API: {e}")
            raise


class AddTaskCommand(TodoCommandBase):
    """
    Команда добавления задачи
    
    Примеры распознанной речи:
    - "команда добавить задачу купить молоко"
    - "команда добавить купить хлеб"
    - "команда новая задача позвонить врачу"
    """
    
    def __init__(self, action: str, description: str, params: dict = None):
        super().__init__(params.get('api_url', 'http://localhost:8000'))
        self.action = action
        self.description = description
        self.params = params or {}
    
    def extract_task_title(self, text: str) -> Optional[str]:
        """
        Извлечь название задачи из распознанного текста
        
        Args:
            text: Распознанный текст, например "команда добавить задачу купить молоко"
            
        Returns:
            Название задачи или None
        """
        # Паттерны для извлечения задачи
        patterns = [
            r'добавить задачу (.+)',
            r'добавить (.+)',
            r'новая задача (.+)',
            r'создать задачу (.+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text.lower())
            if match:
                title = match.group(1).strip()
                return title
        
        return None
    
    def execute(self, recognized_text: str = ""):
        """
        Выполнить команду добавления задачи
        
        Args:
            recognized_text: Полный распознанный текст
        """
        # Извлекаем название задачи из текста
        task_title = self.extract_task_title(recognized_text)
        
        if not task_title:
            return {
                'success': False,
                'message': 'Не удалось распознать название задачи',
                'action': self.action
            }
        
        # Создаём задачу через API
        try:
            response = self._make_request(
                'POST',
                '/api/tasks',
                json={
                    'title': task_title,
                    'priority': self.params.get('default_priority', 999)
                }
            )
            
            task = response.json()
            logger.info(f"✅ Задача создана: '{task_title}' (ID: {task['id']})")
            
            return {
                'success': True,
                'message': f"Задача добавлена: {task_title}",
                'action': self.action,
                'data': task
            }
            
        except Exception as e:
            logger.error(f"Ошибка создания задачи: {e}")
            return {
                'success': False,
                'message': f"Не удалось добавить задачу: {str(e)}",
                'action': self.action,
                'error_code': 'API_ERROR'
            }


class DeleteTaskCommand(TodoCommandBase):
    """
    Команда удаления задачи
    
    Примеры:
    - "команда удалить задачу номер один"
    - "команда удалить первую"
    - "команда убрать задачу три"
    """
    
    def __init__(self, action: str, description: str, params: dict = None):
        super().__init__(params.get('api_url', 'http://localhost:8000'))
        self.action = action
        self.description = description
        self.params = params or {}
    
    def extract_task_number(self, text: str) -> Optional[int]:
        """Извлечь номер задачи из текста"""
        # Словарь для преобразования слов в числа
        word_to_num = {
            'один': 1, 'первая': 1, 'первую': 1,
            'два': 2, 'вторая': 2, 'вторую': 2,
            'три': 3, 'третья': 3, 'третью': 3,
            'четыре': 4, 'четвертая': 4, 'четвертую': 4,
            'пять': 5, 'пятая': 5, 'пятую': 5,
        }
        
        text_lower = text.lower()
        
        # Ищем числом
        num_match = re.search(r'номер (\d+)', text_lower)
        if num_match:
            return int(num_match.group(1))
        
        # Ищем словом
        for word, num in word_to_num.items():
            if word in text_lower:
                return num
        
        return None
    
    def get_task_by_priority(self, priority: int) -> Optional[dict]:
        """Получить задачу по приоритету"""
        try:
            response = self._make_request('GET', '/api/tasks')
            tasks = response.json()
            
            # Сортируем по приоритету
            tasks_sorted = sorted(tasks, key=lambda t: t['priority'])
            
            if 0 < priority <= len(tasks_sorted):
                return tasks_sorted[priority - 1]
            
            return None
        except Exception as e:
            logger.error(f"Ошибка получения задачи: {e}")
            return None
    
    def execute(self, recognized_text: str = ""):
        """Выполнить команду удаления задачи"""
        task_num = self.extract_task_number(recognized_text)
        
        if not task_num:
            return {
                'success': False,
                'message': 'Не удалось распознать номер задачи',
                'action': self.action
            }
        
        # Получаем задачу по номеру
        task = self.get_task_by_priority(task_num)
        
        if not task:
            return {
                'success': False,
                'message': f'Задача номер {task_num} не найдена',
                'action': self.action
            }
        
        # Удаляем задачу
        try:
            self._make_request('DELETE', f"/api/tasks/{task['id']}")
            logger.info(f"🗑️  Задача удалена: '{task['title']}' (ID: {task['id']})")
            
            return {
                'success': True,
                'message': f"Задача удалена: {task['title']}",
                'action': self.action
            }
            
        except Exception as e:
            logger.error(f"Ошибка удаления задачи: {e}")
            return {
                'success': False,
                'message': f"Не удалось удалить задачу: {str(e)}",
                'action': self.action,
                'error_code': 'API_ERROR'
            }


class ListTasksCommand(TodoCommandBase):
    """
    Команда просмотра списка задач
    
    Примеры:
    - "команда список задач"
    - "команда покажи задачи"
    - "команда что нужно сделать"
    """
    
    def __init__(self, action: str, description: str, params: dict = None):
        super().__init__(params.get('api_url', 'http://localhost:8000'))
        self.action = action
        self.description = description
        self.params = params or {}
    
    def execute(self, recognized_text: str = ""):
        """Выполнить команду получения списка задач"""
        try:
            response = self._make_request('GET', '/api/tasks')
            tasks = response.json()
            
            if not tasks:
                return {
                    'success': True,
                    'message': 'Задач нет',
                    'action': self.action,
                    'data': []
                }
            
            # Формируем читаемый список
            task_list = []
            for idx, task in enumerate(sorted(tasks, key=lambda t: t['priority']), 1):
                task_list.append(f"{idx}. {task['title']}")
            
            message = f"Задач: {len(tasks)}. " + ", ".join(task_list)
            
            logger.info(f"📋 Получен список из {len(tasks)} задач")
            
            return {
                'success': True,
                'message': message,
                'action': self.action,
                'data': tasks
            }
            
        except Exception as e:
            logger.error(f"Ошибка получения списка задач: {e}")
            return {
                'success': False,
                'message': f"Не удалось получить список задач: {str(e)}",
                'action': self.action,
                'error_code': 'API_ERROR'
            }
